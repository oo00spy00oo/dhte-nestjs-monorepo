import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ClientGrpc, ClientKafka, RpcException } from '@nestjs/microservices';
import { UserService } from '@zma-nestjs-monorepo/zma-grpc';
import { Exception } from '@zma-nestjs-monorepo/zma-middlewares';
import {
  AuthenticatedUser,
  ErrorCode,
  KafkaToken,
  KafkaTopic,
  MicroserviceInput,
  ServiceName,
  TenantServiceSubject,
  UserServiceSubject,
  UserServiceUserStatus,
  UserServiceUserType,
} from '@zma-nestjs-monorepo/zma-types';
import { UserServiceCreateUserSubjectInput } from '@zma-nestjs-monorepo/zma-types/inputs/user';
import {
  TenantServiceInputMapper,
  TenantServiceOutputMapper,
  UserServiceEventInputMapper,
  UserServiceInputMapper,
  UserServiceOutputMapper,
} from '@zma-nestjs-monorepo/zma-types/mappers/user';
import {
  UserServiceSocialProvider,
  UserServiceSocialProviders,
  UserServiceUser,
} from '@zma-nestjs-monorepo/zma-types/outputs/user/user';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import * as bcrypt from 'bcryptjs';
import dayjs from 'dayjs';
import { OAuth2Client } from 'google-auth-library';
import { firstValueFrom } from 'rxjs';

import { appConfiguration } from '../../configuration';
import {
  ChangePasswordInput,
  ForgotPasswordInput,
  ImpersonateUserInput,
  LoginInput,
  RegisterInput,
  RegisterPasswordPolicy,
  ResetPasswordInput,
  VerificationTokenInput,
  ZaloLoginInput,
} from '../../core/inputs';
import { TokenOutput } from '../../core/outputs';
import { DurationUnit } from '../../core/types';
import { IZaloProfile } from '../../services/zalo/interfaces';
import { ZaloService } from '../../services/zalo/zalo.service';
import { CommonUtil } from '../../utils';

import { AuthFactoryService } from './auth-factory.service';

@Injectable()
export class AuthUseCase {
  private readonly logger = new Logger(AuthUseCase.name);
  private userService: UserService;
  private googleClient: OAuth2Client;
  private readonly appConfig: ReturnType<typeof appConfiguration>;

  constructor(
    @Inject(ServiceName.USER) private readonly clientGrpc: ClientGrpc,
    @Inject(KafkaToken.AuthService) private readonly kafkaClient: ClientKafka,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly zaloService: ZaloService,
    private readonly authFactoryService: AuthFactoryService,
  ) {
    this.appConfig = appConfiguration(this.configService);
    this.setupGoogleClient();
  }

  private setupGoogleClient(): void {
    const { clientId, clientSecret } = this.appConfig.google;
    this.googleClient = new OAuth2Client(clientId, clientSecret);
  }

  onModuleInit(): void {
    this.initializeUserService();
  }

  private initializeUserService(): void {
    this.userService = this.clientGrpc.getService<UserService>(ServiceName.USER);
  }

  private createMicroserviceInput<T>(data: T): MicroserviceInput<T> {
    return new MicroserviceInput<T>({
      data,
      requestId: IdUtils.uuidv7(),
    });
  }

  private validateUser(user: UserServiceUser): void {
    if (!user) {
      throw new Exception(ErrorCode.USER_NOT_FOUND);
    }
    if (user.status === UserServiceUserStatus.Suspended) {
      throw new Exception(ErrorCode.USER_ACCOUNT_SUSPENDED);
    }
    if (user.status === UserServiceUserStatus.Inactive) {
      throw new Exception(ErrorCode.USER_ACCOUNT_INACTIVE);
    }
    if (user.status === UserServiceUserStatus.Pending) {
      throw new Exception(ErrorCode.USER_ACCOUNT_PENDING);
    }
  }

  private async updateUserStatus({
    tenantId,
    userId,
    status,
  }: {
    tenantId: string;
    userId: string;
    status: string;
  }): Promise<UserServiceUser> {
    const input = this.createMicroserviceInput<
      UserServiceInputMapper<UserServiceSubject.UpdateStatus>
    >({
      id: userId,
      status,
      tenantId,
    });
    return firstValueFrom(this.userService.userServiceUpdateStatus(input));
  }

  private async resetUserFailedLoginAttempts({
    userId,
    tenantId,
  }: {
    userId: string;
    tenantId: string;
  }): Promise<UserServiceUser> {
    const input = this.createMicroserviceInput<UserServiceInputMapper<UserServiceSubject.Update>>({
      id: userId,
      tenantId,
      failedLoginAttempts: 0,
    });
    return firstValueFrom(this.userService.userServiceUpdate(input));
  }

  private async resetVerificationCode({
    userId,
    tenantId,
  }: {
    userId: string;
    tenantId: string;
  }): Promise<UserServiceUser> {
    const input = this.createMicroserviceInput<
      UserServiceInputMapper<UserServiceSubject.ResetVerificationCode>
    >({
      id: userId,
      tenantId,
    });
    return firstValueFrom(this.userService.userServiceResetVerificationCode(input));
  }

  private getRegisterPasswordPolicy(): RegisterPasswordPolicy {
    const configPasswordPolicy = this.appConfig.passwordPolicy;
    return {
      minLength: configPasswordPolicy.minLength,
      maxLength: configPasswordPolicy.maxLength,
      uppercase: configPasswordPolicy.requireUppercase,
      lowercase: configPasswordPolicy.requireLowercase,
      numbers: configPasswordPolicy.requireNumbers,
      specialChars: configPasswordPolicy.requireSpecialCharacters,
    };
  }

  private async incrementFailedLoginAttempts({
    userId,
    tenantId,
  }: {
    userId: string;
    tenantId: string;
  }): Promise<number> {
    const input = this.createMicroserviceInput<
      UserServiceInputMapper<UserServiceSubject.IncrementFailedLoginAttempts>
    >({ id: userId, tenantId });

    const result = await firstValueFrom(
      this.userService.userServiceIncrementFailedLoginAttempts(input),
    );
    return result.failedLoginAttempts;
  }

  private async updateUserSocialProviders({
    userId,
    tenantId,
    socialProviders,
  }: {
    userId: string;
    tenantId: string;
    socialProviders: UserServiceSocialProviders;
  }): Promise<UserServiceUser> {
    const input = this.createMicroserviceInput<
      UserServiceInputMapper<UserServiceSubject.UpdateSocialProviders>
    >({
      id: userId,
      tenantId,
      socialProviders,
    });
    return firstValueFrom(this.userService.userServiceUpdateSocialProviders(input));
  }

  private generateVerificationToken({
    input,
    expirationInSeconds,
  }: {
    input: VerificationTokenInput;
    expirationInSeconds: number;
  }): string {
    return this.jwtService.sign(input, {
      secret: this.appConfig.jwt.secret,
      expiresIn: expirationInSeconds,
    });
  }

  private async findTenantById(
    tenantId: string,
  ): Promise<TenantServiceOutputMapper<TenantServiceSubject.FindById>> {
    const findTenantInput = this.createMicroserviceInput<
      TenantServiceInputMapper<TenantServiceSubject.FindById>
    >({ id: tenantId, tenantId });
    const tenant = await firstValueFrom(this.userService.tenantServiceFindById(findTenantInput));
    if (!tenant) {
      throw new Exception(ErrorCode.TENANT_NOT_FOUND);
    }
    return tenant;
  }

  private async findUserByEmail({
    email,
    tenantId,
  }: {
    email: string;
    tenantId: string;
  }): Promise<UserServiceUser> {
    const input = this.createMicroserviceInput<
      UserServiceInputMapper<UserServiceSubject.FindByEmail>
    >({
      email,
      tenantId,
    });
    const user = await firstValueFrom(this.userService.userServiceFindByEmail(input));
    if (!user) {
      throw new Exception(ErrorCode.USER_NOT_FOUND);
    }
    return user;
  }

  private async createUser(
    userData: UserServiceInputMapper<UserServiceSubject.Create>,
  ): Promise<UserServiceOutputMapper<UserServiceSubject.Create>> {
    const input = this.createMicroserviceInput(userData);
    return firstValueFrom(this.userService.userServiceCreate(input));
  }

  private async findUserById({
    id,
    tenantId,
  }: {
    id: string;
    tenantId: string;
  }): Promise<UserServiceUser> {
    const input = this.createMicroserviceInput<UserServiceInputMapper<UserServiceSubject.FindById>>(
      {
        id,
        tenantId,
      },
    );
    const user = await firstValueFrom(this.userService.userServiceFindById(input));
    if (!user) {
      throw new Exception(ErrorCode.USER_NOT_FOUND);
    }
    return user;
  }

  async getUser(id: string): Promise<UserServiceUser> {
    const user = await this.findUserById({ id, tenantId: null });
    return this.authFactoryService.transform(user);
  }

  async loginWithEmail({
    input,
    tenantId,
  }: {
    input: LoginInput;
    tenantId: string;
  }): Promise<TokenOutput> {
    const user = await this.findUserByEmail({ email: input.email, tenantId });

    this.validateUser(user);

    const MAX_LOGIN_ATTEMPTS = this.appConfig.maxLoginAttempts;

    if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
      await this.updateUserStatus({
        tenantId: user.tenantId,
        userId: user._id,
        status: UserServiceUserStatus.Suspended,
      });
      throw new Exception(ErrorCode.USER_ACCOUNT_SUSPENDED);
    }

    const isPasswordValid = await this.verifyPassword({
      plainPassword: input.password,
      hashedPassword: user.password,
    });
    if (!isPasswordValid) {
      await this.incrementFailedLoginAttempts({ userId: user._id, tenantId: user.tenantId });
      throw new Exception(ErrorCode.INVALID_CREDENTIALS);
    }

    if (user.failedLoginAttempts > 0) {
      const resetUser = await this.resetUserFailedLoginAttempts({
        userId: user._id,
        tenantId: user.tenantId,
      });
      return this.generateToken(resetUser);
    }

    return this.generateToken(user);
  }

  async zaloLogin(tenantId: string, data: ZaloLoginInput): Promise<TokenOutput> {
    const { token } = data;
    const zaloProfile = await this.zaloService.getProfile(token, tenantId);
    if (!zaloProfile?.id) {
      throw new Exception(ErrorCode.INVALID_ZALO_ACCESS_TOKEN);
    }
    let phoneNumber = '';
    if (data?.phoneNumberToken) {
      const phoneNumberProfile = await this.zaloService.getPhoneNumber(
        tenantId,
        data.token,
        data.phoneNumberToken,
      );
      if (phoneNumberProfile?.data?.number) {
        phoneNumber = phoneNumberProfile.data.number;
      }
    }
    const input = new MicroserviceInput<
      UserServiceInputMapper<UserServiceSubject.FindByZaloIdAndTenantId>
    >({
      data: {
        zaloId: zaloProfile.id,
        tenantId,
      },
      requestId: IdUtils.uuidv7(),
    });
    try {
      const user: UserServiceOutputMapper<UserServiceSubject.FindByZaloIdAndTenantId> =
        await firstValueFrom(this.userService.userServiceFindByZaloIdAndTenantId(input));
      if (user) {
        this.updatePhoneNumberForZaloUser({
          userId: user._id,
          phoneNumber,
          tenantId,
        });
        return this.generateToken(user);
      }
    } catch (error) {
      if (error?.message.includes(ErrorCode.USER_NOT_FOUND)) {
        return this.createZaloUser(zaloProfile, tenantId, phoneNumber);
      }
      throw new RpcException(error);
    }
  }

  async updatePhoneNumberForZaloUser({
    userId,
    phoneNumber,
    tenantId,
  }: {
    userId: string;
    phoneNumber: string;
    tenantId: string;
  }) {
    const input = this.createMicroserviceInput<UserServiceInputMapper<UserServiceSubject.Update>>({
      id: userId,
      phoneNumber,
      tenantId,
    });
    await firstValueFrom(this.userService.userServiceUpdate(input));
  }

  async createZaloUser(
    zaloProfile: IZaloProfile,
    tenantId: string,
    phoneNumber: string,
  ): Promise<TokenOutput> {
    // create user
    const newUser: UserServiceCreateUserSubjectInput = {
      zaloId: zaloProfile.id,
      firstName: zaloProfile.name,
      avatarUrl: zaloProfile.picture.data.url,
      tenantId,
      type: UserServiceUserType.Zalo,
      phoneNumber,
    };
    const inputCreate = new MicroserviceInput<UserServiceInputMapper<UserServiceSubject.Create>>({
      data: newUser,
      requestId: IdUtils.uuidv7(),
    });
    const entity: UserServiceOutputMapper<UserServiceSubject.Create> = await firstValueFrom(
      this.userService.userServiceCreateZaloUser(inputCreate),
    );
    if (!entity) {
      throw new Exception(ErrorCode.USER_ALREADY_EXISTS);
    }

    return this.generateToken(entity);
  }

  async registerWithEmail({
    tenantId,
    input,
  }: {
    tenantId: string;
    input: RegisterInput;
  }): Promise<boolean> {
    try {
      const existingUser = await this.findUserByEmail({ email: input.email, tenantId });
      if (existingUser) {
        throw new Exception(ErrorCode.EMAIL_ALREADY_EXISTS);
      }
    } catch (error) {
      if (error?.details !== ErrorCode.USER_NOT_FOUND) {
        this.logger.error(`Failed to check email: ${error.message}`);
        throw error;
      }
    }

    const tenant = await this.findTenantById(tenantId);
    if (!tenant.registerEnabled) {
      throw new Exception(ErrorCode.OPERATION_NOT_ALLOWED);
    }

    const passwordValidationErrors = CommonUtil.validatePassword({
      password: input.password,
      policy: this.getRegisterPasswordPolicy(),
    });

    if (passwordValidationErrors.length > 0) {
      this.logger.error(passwordValidationErrors.join(', '));
      throw new Exception(ErrorCode.PASSWORD_RULES_MISMATCH);
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const createUserInput = {
      ...input,
      tenantId,
      organizationId: tenant.organizationId,
      firstName: input.firstName,
      lastName: input.lastName,
      password: hashedPassword,
      verificationCode: CommonUtil.generateVerificationCode(),
    };

    const entity = await this.createUser(createUserInput);

    const expirationInSeconds = CommonUtil.parseDuration({
      duration: this.appConfig.authExpiration.registration,
      outputUnit: DurationUnit.Second,
    });

    const payload: VerificationTokenInput = {
      userId: entity._id,
      verificationCode: entity.verificationCode,
    };

    const token = this.generateVerificationToken({
      input: payload,
      expirationInSeconds,
    });

    // Emit userCreatedEvent to Kafka
    const userCreatedEventInput: UserServiceEventInputMapper<KafkaTopic.UserCreatedEventTopic> = {
      requestId: IdUtils.uuidv7(),
      userId: entity._id,
      tenantId: entity.tenantId,
      appDomain: this.appConfig.appDomain,
      token,
    };

    try {
      this.kafkaClient.emit<string, UserServiceEventInputMapper<KafkaTopic.UserCreatedEventTopic>>(
        KafkaTopic.UserCreatedEventTopic,
        userCreatedEventInput,
      );
    } catch (error) {
      this.logger.error('Failed to emit userCreatedEvent event', error);
    }
    return !!entity;
  }

  async forgotPassword({
    input,
    tenantId,
  }: {
    input: ForgotPasswordInput;
    tenantId: string;
  }): Promise<boolean> {
    const existingUser = await this.findUserByEmail({ email: input.email, tenantId });

    if (!existingUser) {
      throw new Exception(ErrorCode.USER_NOT_FOUND);
    }

    const inputUpdate = this.createMicroserviceInput<
      UserServiceInputMapper<UserServiceSubject.Update>
    >({
      id: existingUser._id,
      tenantId: existingUser.tenantId,
      verificationCode: CommonUtil.generateVerificationCode(),
    });

    const updatedEntity = await firstValueFrom(this.userService.userServiceUpdate(inputUpdate));

    const expirationInSeconds = CommonUtil.parseDuration({
      duration: this.appConfig.authExpiration.forgotPassword,
      outputUnit: DurationUnit.Second,
    });

    const payload: VerificationTokenInput = {
      userId: updatedEntity._id,
      verificationCode: updatedEntity.verificationCode,
    };

    const token = this.generateVerificationToken({
      input: payload,
      expirationInSeconds,
    });

    const userForgotPasswordEventInput: UserServiceEventInputMapper<KafkaTopic.UserForgotPasswordEventTopic> =
      {
        requestId: IdUtils.uuidv7(),
        userId: updatedEntity._id,
        tenantId: updatedEntity.tenantId,
        appDomain: this.appConfig.appDomain,
        token,
      };

    try {
      this.kafkaClient.emit<
        string,
        UserServiceEventInputMapper<KafkaTopic.UserForgotPasswordEventTopic>
      >(KafkaTopic.UserForgotPasswordEventTopic, userForgotPasswordEventInput);
    } catch (error) {
      this.logger.error('Failed to emit userForgotPasswordEvent event', error);
    }

    return !!updatedEntity;
  }

  private async verifyPassword({
    plainPassword,
    hashedPassword,
  }: {
    plainPassword: string;
    hashedPassword: string;
  }): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async changePassword({
    userId,
    input,
    tenantId,
  }: {
    userId: string;
    input: ChangePasswordInput;
    tenantId: string;
  }): Promise<boolean> {
    const passwordValidationErrors = CommonUtil.validatePassword({
      password: input.newPassword,
      policy: this.getRegisterPasswordPolicy(),
    });

    if (passwordValidationErrors.length > 0) {
      this.logger.error(passwordValidationErrors.join(', '));
      throw new Exception(ErrorCode.PASSWORD_RULES_MISMATCH);
    }
    const existingUser = await this.findUserById({ id: userId, tenantId });

    if (!existingUser) {
      throw new Exception(ErrorCode.USER_NOT_FOUND);
    }

    // Verify current password
    if (
      !(await this.verifyPassword({
        plainPassword: input.currentPassword,
        hashedPassword: existingUser.password,
      }))
    ) {
      throw new Exception(ErrorCode.INVALID_CREDENTIALS);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(input.newPassword, 10);

    const inputUpdate = this.createMicroserviceInput<
      UserServiceInputMapper<UserServiceSubject.Update>
    >({
      id: userId,
      tenantId: existingUser.tenantId,
      password: hashedPassword,
    });
    const updatedEntity = await firstValueFrom(this.userService.userServiceUpdate(inputUpdate));

    return !!updatedEntity;
  }

  async resetPassword({
    input,
    tenantId,
  }: {
    input: ResetPasswordInput;
    tenantId: string;
  }): Promise<boolean> {
    try {
      const passwordValidationErrors = CommonUtil.validatePassword({
        password: input.newPassword,
        policy: this.getRegisterPasswordPolicy(),
      });

      if (passwordValidationErrors.length > 0) {
        this.logger.error(passwordValidationErrors.join(', '));
        throw new Exception(ErrorCode.PASSWORD_RULES_MISMATCH);
      }
      const payload: VerificationTokenInput = this.jwtService.verify(input.token, {
        secret: this.appConfig.jwt.secret,
      });

      const confirmByCodeInput = this.createMicroserviceInput<
        UserServiceInputMapper<UserServiceSubject.ConfirmByCode>
      >({
        id: payload.userId,
        tenantId,
        code: payload.verificationCode,
      });
      const entity = await firstValueFrom(
        this.userService.userServiceConfirmByCode(confirmByCodeInput),
      );

      const hashedPassword = await bcrypt.hash(input.newPassword, 10);
      const inputUpdate = this.createMicroserviceInput<
        UserServiceInputMapper<UserServiceSubject.Update>
      >({
        id: entity._id,
        tenantId: entity.tenantId,
        password: hashedPassword,
      });
      const updatedEntity = await firstValueFrom(this.userService.userServiceUpdate(inputUpdate));

      return !!updatedEntity;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        const payload: VerificationTokenInput = this.jwtService.decode(input.token);
        await this.resetVerificationCode({ userId: payload.userId, tenantId });
        throw new Exception(ErrorCode.VERIFICATION_TOKEN_EXPIRED);
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Exception(ErrorCode.INVALID_VERIFICATION_TOKEN);
      }
      throw error;
    }
  }

  async refreshToken({
    refreshToken,
    tenantId,
  }: {
    refreshToken: string;
    tenantId: string;
  }): Promise<TokenOutput> {
    try {
      // Verify the refresh token using the refresh secret
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.appConfig.jwt.refreshSecret,
      });
      // Get user from database to ensure they still exist and are active
      const user = await this.findUserById({ id: payload.sub, tenantId });

      if (user.status !== UserServiceUserStatus.Active) {
        throw new Exception(ErrorCode.INVALID_REFRESH_TOKEN);
      }

      // Return transformed user with new tokens
      return this.generateToken(user);
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async generateToken(user: UserServiceUser): Promise<TokenOutput> {
    const payload: AuthenticatedUser = {
      sub: user._id,
      id: user._id,
      zaloId: user?.zaloId ?? '',
      email: user?.email ?? '',
      type: user.type,
      tenantIds: [user?.tenantId ?? ''],
      organizationId: user?.organizationId ?? '',
    };

    if (!user.zaloId) {
      const inputTenant = this.createMicroserviceInput<
        TenantServiceInputMapper<TenantServiceSubject.FindByOrganizationId>
      >({
        organizationId: user.organizationId,
      });

      // get tenants of user's organization
      const tenants: TenantServiceOutputMapper<TenantServiceSubject.FindByOrganizationId> =
        await firstValueFrom(this.userService.tenantServiceFindByOrganizationId(inputTenant));
      payload.tenantIds = tenants?.data?.map((tenant) => tenant._id) ?? [];
    }

    const { jwt } = this.appConfig;
    const accessToken = this.jwtService.sign(payload, {
      secret: jwt.secret,
      expiresIn: jwt.expirationTime,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: jwt.refreshSecret,
      expiresIn: jwt.refreshExpirationTime,
    });

    return {
      user: this.authFactoryService.transform(user),
      accessToken,
      accessTokenExpiry: dayjs().add(jwt.expirationTime, 'milliseconds').toISOString(),
      refreshToken,
      refreshTokenExpiry: dayjs().add(jwt.refreshExpirationTime, 'milliseconds').toISOString(),
    };
  }

  async confirmRegister({
    token,
    tenantId,
  }: {
    token: string;
    tenantId: string;
  }): Promise<boolean> {
    try {
      const payload: VerificationTokenInput = this.jwtService.verify(token, {
        secret: this.appConfig.jwt.secret,
      });
      const input = this.createMicroserviceInput<
        UserServiceInputMapper<UserServiceSubject.ConfirmByCode>
      >({
        id: payload.userId,
        tenantId,
        code: payload.verificationCode,
      });
      const user = await firstValueFrom(this.userService.userServiceConfirmByCode(input));
      return !!user;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        const payload: VerificationTokenInput = this.jwtService.decode(token);
        await this.resetVerificationCode({ userId: payload.userId, tenantId });
        throw new Exception(ErrorCode.VERIFICATION_TOKEN_EXPIRED);
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Exception(ErrorCode.INVALID_VERIFICATION_TOKEN);
      }
      throw error;
    }
  }

  async loginWithGoogle({
    tenantId,
    token,
  }: {
    tenantId: string;
    token: string;
  }): Promise<TokenOutput> {
    let googleId: string;
    let email: string;
    let firstName: string;
    let lastName: string;

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.appConfig.google.clientId,
      });
      const payload = ticket.getPayload();

      googleId = payload.sub;
      email = payload.email;
      firstName = payload.given_name;
      lastName = payload.family_name;
    } catch (error) {
      this.logger.error('Google authentication failed', error);
      throw new Exception(ErrorCode.GOOGLE_AUTHENTICATION_FAILED);
    }

    const googleProvider: UserServiceSocialProvider = {
      id: googleId,
      email,
    };

    try {
      let user = await this.findUserByEmail({ email, tenantId });
      this.validateUser(user);
      if (user.failedLoginAttempts > 0) {
        user = await this.resetUserFailedLoginAttempts({
          userId: user._id,
          tenantId: user.tenantId,
        });
      }
      const hasGoogleProvider = user.socialProviders?.google;
      if (!hasGoogleProvider) {
        const updatedSocialProviders: UserServiceSocialProviders = {
          ...user.socialProviders,
          google: googleProvider,
        };
        user = await this.updateUserSocialProviders({
          userId: user._id,
          tenantId: user.tenantId,
          socialProviders: updatedSocialProviders,
        });
      }
      return this.generateToken(user);
    } catch (error) {
      if (error?.details === ErrorCode.USER_NOT_FOUND) {
        const tenant = await this.findTenantById(tenantId);
        const createUserInput: UserServiceInputMapper<UserServiceSubject.Create> = {
          tenantId,
          organizationId: tenant.organizationId,
          firstName,
          lastName,
          email,
          socialProviders: {
            google: googleProvider,
          },
        };

        const entity = await this.createUser(createUserInput);
        const updatedEntity = await this.updateUserStatus({
          tenantId: entity.tenantId,
          userId: entity._id,
          status: UserServiceUserStatus.Active,
        });
        return this.generateToken(updatedEntity);
      } else {
        throw error;
      }
    }
  }

  async impersonateUser({
    currentUser,
    input,
    tenantId,
  }: {
    currentUser: AuthenticatedUser;
    input: ImpersonateUserInput;
    tenantId: string;
  }): Promise<TokenOutput> {
    // Find the target user
    const targetUser = await this.findUserById({
      id: input.targetUserId,
      tenantId,
    });

    // Validate the target user status
    this.validateUser(targetUser);

    // Validate impersonation permissions based on user type
    switch (currentUser.type) {
      case UserServiceUserType.Admin:
        // Admin can impersonate any OrganizationAdmin
        if (targetUser.type !== UserServiceUserType.OrganizationAdmin) {
          throw new Exception(ErrorCode.INVALID_USER_TYPE);
        }
        break;

      case UserServiceUserType.Agency: {
        // Agency can only impersonate OrganizationAdmins they created
        const agencyValidationInput = this.createMicroserviceInput({
          agencyUserId: currentUser.id,
          targetUserId: input.targetUserId,
          tenantId,
        });
        try {
          await firstValueFrom(
            this.userService.userServiceValidateAgencyCanImpersonate(agencyValidationInput),
          );
        } catch {
          throw new Exception(ErrorCode.OPERATION_NOT_ALLOWED);
        }
        break;
      }

      case UserServiceUserType.OrganizationAdmin: {
        // OrganizationAdmin can only impersonate TenantAdmins they created
        const orgAdminValidationInput = this.createMicroserviceInput({
          organizationAdminUserId: currentUser.id,
          targetUserId: input.targetUserId,
          tenantId,
        });
        try {
          await firstValueFrom(
            this.userService.userServiceValidateOrganizationAdminCanImpersonate(
              orgAdminValidationInput,
            ),
          );
        } catch {
          throw new Exception(ErrorCode.OPERATION_NOT_ALLOWED);
        }
        break;
      }

      default:
        throw new Exception(ErrorCode.OPERATION_NOT_ALLOWED);
    }

    // Generate impersonation token with modified payload
    const payload: AuthenticatedUser = {
      sub: targetUser._id,
      id: targetUser._id,
      zaloId: targetUser?.zaloId ?? '',
      email: targetUser?.email ?? '',
      type: targetUser.type,
      tenantIds: [targetUser?.tenantId ?? ''],
      organizationId: targetUser?.organizationId ?? '',
      impersonatedBy: currentUser.id,
      isImpersonation: true,
    };

    if (!targetUser.zaloId) {
      const inputTenant = this.createMicroserviceInput<
        TenantServiceInputMapper<TenantServiceSubject.FindByOrganizationId>
      >({
        organizationId: targetUser.organizationId,
      });

      // get tenants of user's organization
      const tenants: TenantServiceOutputMapper<TenantServiceSubject.FindByOrganizationId> =
        await firstValueFrom(this.userService.tenantServiceFindByOrganizationId(inputTenant));
      payload.tenantIds = tenants?.data?.map((tenant) => tenant._id) ?? [];
    }

    const { jwt } = this.appConfig;
    const accessToken = this.jwtService.sign(payload, {
      secret: jwt.secret,
      expiresIn: jwt.expirationTime,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: jwt.refreshSecret,
      expiresIn: jwt.refreshExpirationTime,
    });

    // Emit impersonation audit event to Kafka
    const impersonationEventInput = {
      requestId: IdUtils.uuidv7(),
      impersonatorId: currentUser.id,
      targetUserId: targetUser._id,
      tenantId,
      timestamp: new Date().toISOString(),
      action: 'IMPERSONATION_STARTED',
    };

    try {
      this.kafkaClient.emit<string, typeof impersonationEventInput>(
        'user.impersonation.started',
        impersonationEventInput,
      );
    } catch (error) {
      this.logger.error('Failed to emit impersonation started event', error);
    }

    return {
      user: this.authFactoryService.transform(targetUser),
      accessToken,
      accessTokenExpiry: dayjs().add(jwt.expirationTime, 'milliseconds').toISOString(),
      refreshToken,
      refreshTokenExpiry: dayjs().add(jwt.refreshExpirationTime, 'milliseconds').toISOString(),
    };
  }
}
