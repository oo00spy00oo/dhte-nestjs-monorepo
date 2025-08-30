import { Injectable } from '@nestjs/common';
import {
  UserServiceUserGqlOutput,
  UserServiceUser,
} from '@zma-nestjs-monorepo/zma-types/outputs/user/user';

@Injectable()
export class AuthFactoryService {
  transform(entity: UserServiceUser): UserServiceUserGqlOutput {
    const ignoreFields = ['password', 'resetToken', 'resetTokenExpiry'];
    const temp: UserServiceUserGqlOutput = {
      ...entity,
    };
    for (const field of ignoreFields) {
      temp[field] = '';
    }
    return temp;
  }
}
