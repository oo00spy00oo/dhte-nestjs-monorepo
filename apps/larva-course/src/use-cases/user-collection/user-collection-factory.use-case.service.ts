import { Injectable } from '@nestjs/common';

import {
  LarvaCourseServiceDetailUserCollectionGqlOutput,
  LarvaCourseServiceGeneralUserCollectionGqlOutput,
  LarvaCourseServiceSentenceOfCollectionGqlOutput,
  LarvaCourseServiceWordOfCollectionGqlOutput,
} from '../../core/outputs';
import { UserCollectionEntity } from '../../frameworks/data-services/mongo/entities';

@Injectable()
export class UserCollectionFactoryService {
  transform(entity: UserCollectionEntity): LarvaCourseServiceGeneralUserCollectionGqlOutput {
    const userCollection: LarvaCourseServiceGeneralUserCollectionGqlOutput = {
      id: entity._id,
      userId: entity.userId,
      name: entity.name,
      words: entity.words,
      sentences: entity.sentences,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
    return userCollection;
  }

  transformDetail({
    entity,
    sentences,
    words,
  }: {
    entity: UserCollectionEntity;
    sentences: LarvaCourseServiceSentenceOfCollectionGqlOutput[];
    words: LarvaCourseServiceWordOfCollectionGqlOutput[];
  }): LarvaCourseServiceDetailUserCollectionGqlOutput {
    const userCollection: LarvaCourseServiceDetailUserCollectionGqlOutput = {
      id: entity._id,
      userId: entity.userId,
      name: entity.name,
      words,
      sentences,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
    return userCollection;
  }
}
