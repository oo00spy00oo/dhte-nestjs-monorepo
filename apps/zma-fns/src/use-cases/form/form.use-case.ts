import { Injectable } from '@nestjs/common';
import { Exception } from '@zma-nestjs-monorepo/zma-middlewares';
import { ErrorCode, Pagination } from '@zma-nestjs-monorepo/zma-types';
import mongoose from 'mongoose';

import { IDataServices } from '../../core';
import { FnsServiceCreateFormGqlInput, FnsServiceUpdateFormGqlInput } from '../../core/inputs';
import { FnsServiceFormGqlOutput, FnsServiceFormsGqlOutput } from '../../core/outputs';

import { FormFactoryService } from './form-factory.use-case';

@Injectable()
export class FormUseCase {
  constructor(
    private readonly factoryService: FormFactoryService,
    private readonly dataServices: IDataServices,
  ) {}

  async createFormForAdmin({
    tenantId,
    input,
  }: {
    tenantId: string;
    input: FnsServiceCreateFormGqlInput;
  }): Promise<FnsServiceFormGqlOutput> {
    const entity = await this.dataServices.formService.create({
      tenantId,
      item: input,
    });
    if (!entity) {
      throw new Exception(ErrorCode.CREATE_FORM_FAILED);
    }
    return this.factoryService.transform(entity);
  }

  async updateFormForAdmin({
    tenantId,
    id,
    input,
  }: {
    tenantId: string;
    id: string;
    input: FnsServiceUpdateFormGqlInput;
  }): Promise<FnsServiceFormGqlOutput> {
    const existingForm = await this.dataServices.formService.findById({
      tenantId,
      id,
    });
    if (!existingForm) {
      throw new Exception(ErrorCode.FORM_NOT_FOUND);
    }
    const entity = await this.dataServices.formService.updateOne({
      tenantId,
      id,
      update: {
        item: input,
      },
    });
    if (!entity) {
      throw new Exception(ErrorCode.UPDATE_FORM_FAILED);
    }
    return this.factoryService.transform(entity);
  }

  async getFormsForAdmin({
    tenantId,
    pagination,
  }: {
    tenantId: string;
    pagination: Pagination;
  }): Promise<FnsServiceFormsGqlOutput> {
    const { skip, limit } = pagination;
    const filter = {
      tenantId: new mongoose.Types.UUID(tenantId),
    };
    const pipeline = [
      { $match: filter },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }, { $sort: { createdAt: -1 } }],
          total: [{ $count: 'count' }],
        },
      },
    ];
    const result = await this.dataServices.formService.aggregate({ pipeline });
    const data = result[0]?.data ?? [];
    const total = result[0]?.total?.[0]?.count ?? 0;
    return this.factoryService.transformMany({
      entities: data,
      total,
    });
  }

  async getFormById({
    tenantId,
    id,
    isAdmin = false,
  }: {
    tenantId: string;
    id: string;
    isAdmin?: boolean;
  }): Promise<FnsServiceFormGqlOutput> {
    const entity = await this.dataServices.formService.findOne({
      tenantId,
      find: {
        filter: {
          _id: id,
          ...(isAdmin ? {} : { isActive: true, isDeleted: false }),
        },
      },
    });
    if (!entity) {
      throw new Exception(ErrorCode.FORM_NOT_FOUND);
    }
    return this.factoryService.transform(entity);
  }
}
