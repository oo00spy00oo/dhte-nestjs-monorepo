import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { MicroserviceInput, ServiceName, FnsServiceSubject } from '@zma-nestjs-monorepo/zma-types';
import {
  FnsServiceInputMapper,
  FnsServiceOutputMapper,
} from '@zma-nestjs-monorepo/zma-types/mappers/fns';

import { UserResponseUseCase } from '../../use-cases/user-response/user-response.use-case';

@Controller()
export class FnsGrpcController {
  private readonly logger = new Logger(FnsGrpcController.name);
  constructor(private readonly userResponseUseCase: UserResponseUseCase) {}

  @GrpcMethod(ServiceName.FNS, FnsServiceSubject.FindUserResponse)
  async handleFindUserResponse(
    @Payload()
    input: MicroserviceInput<FnsServiceInputMapper<FnsServiceSubject.FindUserResponse>>,
  ): Promise<FnsServiceOutputMapper<FnsServiceSubject.FindUserResponse>> {
    this.logger.log(input, 'handleFindUserResponse');
    const result = await this.userResponseUseCase.getUserResponse(input.data);
    return result;
  }
}
