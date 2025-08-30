import { Injectable } from '@nestjs/common';
import { MarkdownUtil } from '@zma-nestjs-monorepo/zma-utils';

import { privacyPolicy } from './data/privacy-policy';
import { termCondition } from './data/term-condition';

@Injectable()
export class MasterDataUseCase {
  async getPrivacyPolicy(): Promise<string> {
    return MarkdownUtil.parse(privacyPolicy);
  }

  async getTermAndCondition(): Promise<string> {
    return MarkdownUtil.parse(termCondition);
  }
}
