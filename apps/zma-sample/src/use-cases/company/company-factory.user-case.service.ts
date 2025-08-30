import { Injectable } from '@nestjs/common';
import _ from 'lodash';

import { Company } from '../../core/models';
import { CompanyEntity } from '../../frameworks/data-services/mongo/entities';

@Injectable()
export class CompanyFactoryService {
  transform(entity: CompanyEntity): Company {
    const company: Company = _.assign(entity);
    return company;
  }
}
