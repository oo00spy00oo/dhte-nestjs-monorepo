import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientGrpc } from '@nestjs/microservices';
import { UserService } from '@zma-nestjs-monorepo/zma-grpc';
import {
  KafkaTopic,
  MicroserviceInput,
  ServiceName,
  UserServiceSubject,
} from '@zma-nestjs-monorepo/zma-types';
import {
  UserServiceEventInputMapper,
  UserServiceInputMapper,
} from '@zma-nestjs-monorepo/zma-types/mappers/user';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import { firstValueFrom } from 'rxjs';

import { IDataServices } from '../../core/abstracts';
import { NodeMailerProvider } from '../notification-channels/email/providers/node-mailer.provider';

import { NotificationFactoryService } from './notification-factory.use-case.service';

@Injectable()
export class NotificationUseCase {
  private readonly logger = new Logger(NotificationUseCase.name);
  private userService: UserService;

  constructor(
    private readonly configService: ConfigService,
    @Inject(ServiceName.USER) private clientGrpc: ClientGrpc,
    private readonly factoryService: NotificationFactoryService,
    private readonly dataServices: IDataServices,
    private readonly nodeMailerProvider: NodeMailerProvider,
  ) {}

  onModuleInit() {
    this.userService = this.clientGrpc.getService<UserService>(ServiceName.USER);
  }

  async handleUserCreatedEvent(
    data: UserServiceEventInputMapper<KafkaTopic.UserCreatedEventTopic>,
  ): Promise<void> {
    const { userId, token, appDomain, tenantId } = data;
    const input = new MicroserviceInput<UserServiceInputMapper<UserServiceSubject.FindById>>({
      data: {
        id: userId,
        tenantId,
      },
      requestId: IdUtils.uuidv7(),
    });
    const existingUser = await firstValueFrom(this.userService.userServiceFindById(input));
    const { email } = existingUser;
    const confirmLink = `${appDomain}/register-verification?token=${token}`;
    await this.nodeMailerProvider.sendEmail({
      to: email,
      subject: 'Welcome to ZMA',
      body: `Please confirm your account by clicking the link: <a href="${confirmLink}">Confirm Account</a>`,
    });
  }

  async handleUserForgotPasswordEvent(
    data: UserServiceEventInputMapper<KafkaTopic.UserForgotPasswordEventTopic>,
  ): Promise<void> {
    const { userId, token, appDomain, tenantId } = data;
    const input = new MicroserviceInput<UserServiceInputMapper<UserServiceSubject.FindById>>({
      data: {
        id: userId,
        tenantId,
      },
      requestId: IdUtils.uuidv7(),
    });
    const existingUser = await firstValueFrom(this.userService.userServiceFindById(input));
    const { email } = existingUser;
    const resetLink = `${appDomain}/reset-password?token=${token}`;
    await this.nodeMailerProvider.sendEmail({
      to: email,
      subject: 'Reset Your Password',
      body: `Please reset your password by clicking the link: <a href="${resetLink}">Reset Password</a>`,
    });
  }
}
