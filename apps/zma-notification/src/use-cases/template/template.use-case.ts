import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Exception } from '@zma-nestjs-monorepo/zma-middlewares';
import {
  ErrorCode,
  LanguageEnum,
  NotificationServiceChannel,
  Pagination,
} from '@zma-nestjs-monorepo/zma-types';
import * as Handlebars from 'handlebars';

import { IDataServices } from '../../core';
import {
  NotificationServiceCreateTemplateGqlInput,
  NotificationServiceUpdateTemplateGqlInput,
} from '../../core/inputs';
import { NotificationServiceTemplateGqlOutput } from '../../core/outputs';
import { CacheKeys } from '../../utils';

import { TemplateFactoryUseCase } from './template-factory.use-case.service';

@Injectable()
export class TemplateUseCase {
  private readonly logger = new Logger(TemplateUseCase.name);
  constructor(
    private templateFactory: TemplateFactoryUseCase,
    private dataServices: IDataServices,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private async getTemplateForRendering({
    tenantId,
    code,
    language,
    channel,
  }: {
    tenantId: string;
    code: string;
    language: LanguageEnum;
    channel: NotificationServiceChannel;
  }): Promise<Handlebars.TemplateDelegate> {
    const cacheKey = CacheKeys.template.render({
      tenantId,
      code,
      language,
      channel,
    });
    const cachedTemplate = await this.cacheManager.get<string>(cacheKey);
    if (cachedTemplate) {
      this.logger.log(`Cache hit for template rendering: ${cacheKey}`);
      return Handlebars.compile(cachedTemplate);
    }
    this.logger.log(`Cache miss for template rendering: ${cacheKey}`);
    const template = await this.dataServices.templateService.findOne({
      tenantId,
      find: {
        filter: {
          code,
          language,
          channel,
          isDeleted: false,
        },
      },
    });
    if (!template) {
      throw new Exception(ErrorCode.TEMPLATE_NOT_FOUND);
    }
    await this.cacheManager.set<string>(cacheKey, template.content, 60 * 10); // Cache for 10 minutes
    return Handlebars.compile(template.content);
  }

  async createTemplate({
    tenantId,
    input,
  }: {
    tenantId: string;
    input: NotificationServiceCreateTemplateGqlInput;
  }): Promise<NotificationServiceTemplateGqlOutput> {
    const existingTemplate = await this.dataServices.templateService.findOne({
      tenantId,
      find: {
        filter: {
          code: input.code,
          language: input.language,
          channel: input.channel,
          isDeleted: false,
        },
      },
    });
    if (existingTemplate) {
      throw new Exception(ErrorCode.TEMPLATE_ALREADY_EXISTS);
    }
    const entityData = {
      ...input,
      tenantId,
    };
    const entity = await this.dataServices.templateService.create({
      tenantId,
      item: entityData,
    });

    if (!entity) {
      throw new Exception(ErrorCode.CREATE_TEMPLATE_FAILED);
    }
    return this.templateFactory.transformTemplate(entity);
  }

  async updateTemplate({
    tenantId,
    id,
    input,
  }: {
    tenantId: string;
    id: string;
    input: NotificationServiceUpdateTemplateGqlInput;
  }): Promise<NotificationServiceTemplateGqlOutput> {
    const existingTemplate = await this.dataServices.templateService.findOne({
      tenantId,
      find: {
        filter: {
          _id: id,
          isDeleted: false,
        },
      },
    });

    if (!existingTemplate) {
      throw new Exception(ErrorCode.TEMPLATE_NOT_FOUND);
    }

    const updatedTemplate = await this.dataServices.templateService.updateOne({
      tenantId,
      id: existingTemplate._id,
      update: {
        item: input,
      },
    });

    if (!updatedTemplate) {
      throw new Exception(ErrorCode.UPDATE_TEMPLATE_FAILED);
    }
    return this.templateFactory.transformTemplate(updatedTemplate);
  }

  async getTemplates({
    tenantId,
    pagination,
  }: {
    tenantId: string;
    pagination: Pagination;
  }): Promise<NotificationServiceTemplateGqlOutput[]> {
    const { skip, limit } = pagination;

    const templateEntities = await this.dataServices.templateService.findMany({
      tenantId,
      find: {
        filter: { isDeleted: false },
      },
      options: { skip, limit, sort: { createdAt: -1 } },
    });

    return templateEntities.map((template) => this.templateFactory.transformTemplate(template));
  }

  async getTemplateById({
    tenantId,
    id,
  }: {
    tenantId: string;
    id: string;
  }): Promise<NotificationServiceTemplateGqlOutput> {
    const templateEntity = await this.dataServices.templateService.findOne({
      tenantId,
      find: {
        filter: { _id: id, isDeleted: false },
      },
    });

    if (!templateEntity) {
      throw new Exception(ErrorCode.TEMPLATE_NOT_FOUND);
    }

    return this.templateFactory.transformTemplate(templateEntity);
  }

  async renderTemplate({
    tenantId,
    code,
    language,
    channel,
    variables,
  }: {
    tenantId: string;
    code: string;
    channel: NotificationServiceChannel;
    language: LanguageEnum;
    variables: Record<string, string>;
  }): Promise<string> {
    const compiledTemplate = await this.getTemplateForRendering({
      tenantId,
      code,
      language,
      channel,
    });
    return compiledTemplate(variables);
  }
}
