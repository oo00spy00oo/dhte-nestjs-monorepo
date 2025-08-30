import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { appConfiguration } from '../../configuration';
import {
  LarvaCourseServiceSentenceGqlOutput,
  LarvaCourseServiceSentencesGqlOutput,
  LarvaCourseServiceSentenceTranslationGqlOutput,
} from '../../core/outputs';
import { SentenceEntity } from '../../frameworks/data-services/mongo/entities';

@Injectable()
export class SentenceFactoryService {
  private readonly appConfig: ReturnType<typeof appConfiguration>;
  constructor(private readonly configService: ConfigService) {
    this.appConfig = appConfiguration(this.configService);
  }

  private generateAssetUrl(key: string): string {
    return `${this.appConfig.r2.commonAssetsBaseUrl}/${key}`;
  }

  transform({
    entity,
    translations,
  }: {
    entity: SentenceEntity;
    translations: LarvaCourseServiceSentenceTranslationGqlOutput[];
  }): LarvaCourseServiceSentenceGqlOutput {
    const sentence: LarvaCourseServiceSentenceGqlOutput = {
      id: entity._id,
      content: entity.content,
      pronunciationText: entity.pronunciationText,
      words: entity.words.map((word) => {
        return {
          ...word,
          audioUrl: word.audioUrl ? this.generateAssetUrl(word.audioUrl) : null,
        };
      }),
      videos: entity.videos
        ? entity.videos.map((video) => {
            return {
              ...video,
              url: video.url ? this.generateAssetUrl(video.url) : null,
            };
          })
        : [],
      status: entity.status,
      translations,
      createdAt: entity.createdAt || new Date(),
      updatedAt: entity.updatedAt || new Date(),
    };
    return sentence;
  }

  transformMany({
    entities,
    total,
  }: {
    entities: ReturnType<typeof this.transform>[];
    total: number;
  }): LarvaCourseServiceSentencesGqlOutput {
    return {
      data: entities,
      total,
    };
  }
}
