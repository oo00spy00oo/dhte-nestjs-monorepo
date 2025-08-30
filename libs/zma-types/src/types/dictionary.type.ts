import { registerEnumType } from '@nestjs/graphql';

export enum DictionaryServiceDictionaryStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Deleted = 'DELETED',
}

registerEnumType(DictionaryServiceDictionaryStatus, {
  name: 'DictionaryServiceDictionaryStatus',
  description: 'The status of the dictionary entry',
});
