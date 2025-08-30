import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
export class UploadResolver {
  @Query(() => String)
  async uploadTest(): Promise<string> {
    return 'Upload service is running!';
  }
}
