import { CurrencyEnum, CurrencyFormat } from '@zma-nestjs-monorepo/zma-types';
import currencyFormat from 'currency.js';

export class CurrencyUtils {
  static format(value: number, currency: CurrencyEnum): string {
    let opts = CurrencyFormat[currency];
    if (!currency) {
      opts = CurrencyFormat[CurrencyEnum.VND];
    }
    return currencyFormat(value, opts).format();
  }
}
