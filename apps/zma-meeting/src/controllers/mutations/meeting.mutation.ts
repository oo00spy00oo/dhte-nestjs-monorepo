import { Mutation, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '@zma-nestjs-monorepo/zma-decorators';
import { AuthenticatedUser } from '@zma-nestjs-monorepo/zma-types';

import { MeetingServiceCreateRoomGqlOutput } from '../../core/outputs';
import { MeetingUseCase } from '../../use-cases/meeting/meeting.use-case';

@Resolver()
export class MeetingMutation {
  constructor(private readonly meetingUseCase: MeetingUseCase) {}

  @Mutation(() => MeetingServiceCreateRoomGqlOutput)
  async meetingServiceCreateRoom(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MeetingServiceCreateRoomGqlOutput> {
    return this.meetingUseCase.createRoom(user.id);
  }
}
