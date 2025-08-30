import { ITenantGenericRepository } from '@zma-nestjs-monorepo/zma-repositories';

import {
  FormEntity,
  SurveyEntity,
  UserResponseEntity,
} from '../../frameworks/data-services/mongo/entities';

export abstract class IDataServices {
  abstract userResponseService: ITenantGenericRepository<UserResponseEntity>;
  abstract surveyService: ITenantGenericRepository<SurveyEntity>;
  abstract formService: ITenantGenericRepository<FormEntity>;
}
