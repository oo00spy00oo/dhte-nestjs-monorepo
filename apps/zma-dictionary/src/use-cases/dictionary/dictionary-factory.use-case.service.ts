import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DictionaryServiceDictionaryGqlOutput } from '@zma-nestjs-monorepo/zma-types/outputs/dictionary';

import { appConfiguration } from '../../configuration';
import { DictionaryEntity } from '../../frameworks/data-services/mongo/entities';

const WEBP_EXTENSION = 'webp';
@Injectable()
export class DictionaryFactoryService {
  private readonly appConfig: ReturnType<typeof appConfiguration>;
  constructor(private readonly configService: ConfigService) {
    this.appConfig = appConfiguration(this.configService);
  }

  private generateImageUrl({ partOfSpeech, word }: { partOfSpeech: string; word: string }): string {
    return `${this.appConfig.r2.dictionaryImagesBaseUrl}/${partOfSpeech.toLowerCase()}/${word}.${WEBP_EXTENSION}`;
  }

  private generateAudioUrl({ dialect, audioKey }: { dialect: string; audioKey: string }): string {
    return `${this.appConfig.r2.dictionaryAudiosBaseUrl}/${dialect.toLowerCase()}/${audioKey}`;
  }

  private generateVideoUrl({ videoKey }: { videoKey: string }): string {
    return `${this.appConfig.r2.commonAssetsBaseUrl}/${videoKey}`;
  }

  transform(entity: DictionaryEntity): DictionaryServiceDictionaryGqlOutput {
    const dictionary: DictionaryServiceDictionaryGqlOutput = {
      id: entity._id,
      word: entity.word,
      wordTranslations: entity.wordTranslations ?? [],
      etymology: entity.etymology,
      images: entity.hasImage
        ? [
            {
              url: this.generateImageUrl({ partOfSpeech: entity.partOfSpeech, word: entity.word }),
            },
          ]
        : [],
      videos: entity.videos
        ? entity.videos.map((video) => {
            return {
              url: this.generateVideoUrl({ videoKey: video.url }),
              caption: video.caption,
            };
          })
        : [],
      pronunciations: entity.hasAudio
        ? entity.pronunciations.map((pronunciation) => {
            return {
              ...pronunciation,
              audioUrl: pronunciation.audioKey
                ? this.generateAudioUrl({
                    dialect: pronunciation.dialect,
                    audioKey: pronunciation.audioKey,
                  })
                : '',
            };
          })
        : entity.pronunciations,
      partOfSpeech: entity.partOfSpeech,
      senses: entity.senses,
      inflections: entity.inflections,
      phrases: entity.phrases,
      status: entity.status,
      hasAudio: entity.hasAudio,
      hasImage: entity.hasImage,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
    return dictionary;
  }
}
