import { Injectable } from '@nestjs/common';

import { NotificationServiceTemplateGqlOutput } from '../../core/outputs';
import { TemplateEntity } from '../../frameworks/data-services/mongo/entities';

@Injectable()
export class TemplateFactoryUseCase {
  transformTemplate(entity: TemplateEntity): NotificationServiceTemplateGqlOutput {
    return {
      _id: entity._id,
      tenantId: entity.tenantId,
      code: entity.code,
      channel: entity.channel,
      language: entity.language,
      content: entity.content,
      subject: entity.subject,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
