import { createHmac } from 'crypto';

import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientGrpc } from '@nestjs/microservices';
import { UserService } from '@zma-nestjs-monorepo/zma-grpc';
import { Exception } from '@zma-nestjs-monorepo/zma-middlewares';
import {
  MicroserviceInput,
  ServiceName,
  TenantServiceSubject,
} from '@zma-nestjs-monorepo/zma-types';
import {
  TenantServiceInputMapper,
  TenantServiceOutputMapper,
} from '@zma-nestjs-monorepo/zma-types/mappers/user';
import { UserServiceTenant } from '@zma-nestjs-monorepo/zma-types/outputs/user/tenant';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import axios, { AxiosInstance } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { firstValueFrom } from 'rxjs';

import { IZaloPhoneNumber, IZaloProfile } from './interfaces';

@Injectable()
export class ZaloService {
  private readonly logger = new Logger(ZaloService.name);
  private readonly httpsAgent: HttpsProxyAgent<string>;
  private readonly axiosInstance: AxiosInstance;
  private userService: UserService;
  constructor(
    private readonly configService: ConfigService,
    @Inject(ServiceName.USER) private clientGrpc: ClientGrpc,
  ) {
    this.httpsAgent = new HttpsProxyAgent(this.configService.get('PROXY'));
    this.axiosInstance = axios.create({
      httpsAgent: this.httpsAgent,
    });
  }

  onModuleInit() {
    this.userService = this.clientGrpc.getService<UserService>(ServiceName.USER);
  }

  calculateHMacSHA256 = (data: string, secretKey: string) => {
    const hmac = createHmac('sha256', secretKey);
    hmac.update(data);
    return hmac.digest('hex');
  };

  async getTenant(id: string): Promise<UserServiceTenant> {
    const input = new MicroserviceInput<TenantServiceInputMapper<TenantServiceSubject.FindById>>({
      data: {
        id,
        tenantId: id,
      },
      requestId: IdUtils.uuidv7(),
    });
    const tenant: TenantServiceOutputMapper<TenantServiceSubject.FindById> = await firstValueFrom(
      this.userService.tenantServiceFindById(input),
    );
    if (!tenant) {
      throw new Exception('Tenant not found');
    }
    return tenant;
  }

  async getProfile(token: string, tenantId: string): Promise<IZaloProfile> {
    const tenant = await this.getTenant(tenantId);
    const zaloSecretKey = tenant.zaloAppSecret;
    const { data } = await this.axiosInstance.get(
      'https://graph.zalo.me/v2.0/me?fields=id,name,birthday,picture',
      {
        headers: {
          access_token: token,
          appsecret_proof: this.calculateHMacSHA256(token, zaloSecretKey),
        },
      },
    );
    if (data?.error) {
      const errorCode = {
        'Session key invalid. This could be because the session key has an incorrect format, or because the user has revoked this session':
          'code_is_invalid',
        'code is invalid': 'code_is_invalid',
      };
      throw new BadRequestException(errorCode[data?.message] || 'invalid_token');
    }
    return data as IZaloProfile;
  }

  async getPhoneNumber(tenantId: string, token: string, code: string): Promise<IZaloPhoneNumber> {
    const tenant = await this.getTenant(tenantId);
    const zaloSecretKey = tenant.zaloAppSecret;
    const { data } = await this.axiosInstance.get('https://graph.zalo.me/v2.0/me/info', {
      headers: {
        code,
        access_token: token,
        secret_key: zaloSecretKey,
      },
    });
    if (data?.error) {
      const errorCode = {
        'code has already been used': 'code_has_already_been_used',
        'code is invalid': 'code_is_invalid',
      };
      throw new BadRequestException(errorCode[data?.message] || 'invalid_token');
    }
    return data as IZaloPhoneNumber;
  }
}
