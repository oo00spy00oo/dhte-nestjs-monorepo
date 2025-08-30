import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class MeetingResolver {
  @Query(() => Boolean)
  async meetingServiceTest(): Promise<boolean> {
    return true;
  }
}
