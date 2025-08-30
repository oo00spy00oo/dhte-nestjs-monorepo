import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientGrpc } from '@nestjs/microservices';
import { FnsService } from '@zma-nestjs-monorepo/zma-grpc';
import { MicroserviceInput, ServiceName, FnsServiceSubject } from '@zma-nestjs-monorepo/zma-types';
import { FnsServiceInputMapper } from '@zma-nestjs-monorepo/zma-types/mappers/fns';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import { firstValueFrom } from 'rxjs';

import { appConfiguration } from '../../configuration';
import { larvaCourseServiceSubjects } from '../../configuration/course';
import { IDataServices } from '../../core/abstracts';
import { LarvaCourseServiceSubjectsGqlOutput } from '../../core/outputs';
import { LarvaCourseServiceCourseStatus } from '../../core/types';

@Injectable()
export class CourseUseCase {
  private logger = new Logger(CourseUseCase.name);
  private fnsService: FnsService;
  constructor(
    private dataServices: IDataServices,
    private configService: ConfigService,
    @Inject(ServiceName.FNS) private fnsClientGrpc: ClientGrpc,
  ) {}

  onModuleInit() {
    this.fnsService = this.fnsClientGrpc.getService<FnsService>(ServiceName.FNS);
  }

  private getSurveyIdForSubject(code: string) {
    switch (code) {
      case 'ENGLISH':
        return appConfiguration(this.configService).surveys.onboarding.english.surveyId;
      default:
        return null;
    }
  }

  private async getSurveyUserResponseForSubject({
    tenantId,
    surveyId,
    userId,
  }: {
    tenantId: string;
    surveyId: string;
    userId: string;
  }) {
    try {
      const microserviceInput = new MicroserviceInput<
        FnsServiceInputMapper<FnsServiceSubject.FindUserResponse>
      >({
        data: {
          tenantId,
          userId,
          surveyId,
        },
        requestId: IdUtils.uuidv7(),
      });
      const userResponse = await firstValueFrom(
        this.fnsService.fnsServiceFindUserResponse(microserviceInput),
      );
      console.log('userResponse', userResponse);
      return userResponse;
    } catch (error) {
      this.logger.error('Error fetching survey user response:', error);
      return null;
    }
  }

  async getSubjectsData({
    tenantId,
    userId,
  }: {
    tenantId: string;
    userId: string;
  }): Promise<LarvaCourseServiceSubjectsGqlOutput[]> {
    const filter = {
      status: LarvaCourseServiceCourseStatus.Active,
    };

    const pipeline = [
      {
        $match: filter,
      },
      //group by skillCode and add field totalTopics
      {
        $group: {
          _id: '$skillCode',
          totalTopics: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          skillCode: '$_id',
          totalTopics: 1,
        },
      },
    ];

    const entity = await this.dataServices.topicService.aggregate({
      pipeline,
    });
    const newSubjects = await Promise.all(
      larvaCourseServiceSubjects.map(async (subject) => {
        const skills = subject.skills.map((skill) => {
          return {
            ...skill,
            totalTopics: entity.find((e) => e.skillCode === skill.code)?.totalTopics || 0,
          };
        });

        const surveyId = this.getSurveyIdForSubject(subject.code);
        const surveyUserResponse = await this.getSurveyUserResponseForSubject({
          tenantId,
          surveyId,
          userId,
        });

        return {
          ...subject,
          skills,
          surveyId,
          hasSurveyResponse: !!surveyUserResponse,
        };
      }),
    );

    return newSubjects;
  }
}
