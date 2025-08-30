import { Module } from '@nestjs/common';

import { RedisModule } from '../../services/redis/redis.module';

import { MeetingFactoryUseCaseService } from './meeting-factory.use-case.service';
import { MeetingUseCase } from './meeting.use-case';

@Module({
  imports: [RedisModule],
  providers: [MeetingFactoryUseCaseService, MeetingUseCase],
  exports: [MeetingFactoryUseCaseService, MeetingUseCase],
})
export class MeetingUseCaseModule {}
