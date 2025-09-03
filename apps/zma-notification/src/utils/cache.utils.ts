import { Pagination } from '@zma-nestjs-monorepo/zma-types';

export class CacheKeys {
  static template = {
    id: ({ tenantId, id }: { tenantId: string; id: string }) => `template:${tenantId}:${id}`,
    list: ({ tenantId, pagination }: { tenantId: string; pagination: Pagination }) =>
      `template:list:${tenantId}:${JSON.stringify(pagination)}`,
    render: ({
      tenantId,
      code,
      language,
      channel,
    }: {
      tenantId: string;
      code: string;
      language: string;
      channel: string;
    }) => `template:render:${tenantId}:${code}:${language}:${channel}`,
  };
}
