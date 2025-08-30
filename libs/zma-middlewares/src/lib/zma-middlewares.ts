/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ErrorCode } from '@zma-nestjs-monorepo/zma-types';
import _ from 'lodash';
import { I18nService } from 'nestjs-i18n';
export function zmaMiddlewares(): string {
  return 'zma-middlewares';
}

export class Exception extends RpcException {
  constructor(code: string, context?: Record<string, any>) {
    super({ code, context, message: code });
  }
}
@Catch(Exception)
export class AppExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  catch(exception: Exception, _host: ArgumentsHost) {
    const error = exception.getError() as { code: string; context?: string };

    if (!error.code) {
      exception.message =
        this.i18n.translate('error.INTERNAL_SERVER_ERROR') || 'INTERNAL_SERVER_ERROR';
      _.set(exception, 'extensions.code', 'UNKNOWN_ERROR');
      throw exception;
    }

    const errorCode = ErrorCode[error.code as keyof typeof ErrorCode];

    if (!errorCode) {
      exception.message = error.code;
      _.set(exception, 'extensions.code', 'UNKNOWN_ERROR');
    } else {
      const args = error.context || {};
      exception.message = this.i18n.translate(`error.${error.code}`, { args }) || error.code;
      _.set(exception, 'extensions.code', error.code);
    }

    throw exception;
  }
}
