import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

import { IDataServices } from '../../../core';

@Injectable()
export class MongoDataServices implements IDataServices, OnApplicationBootstrap {
  onApplicationBootstrap() {
    return;
  }
}
