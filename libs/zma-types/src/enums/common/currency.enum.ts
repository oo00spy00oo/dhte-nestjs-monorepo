/**
 * Currency enumeration for multi-currency support
 *
 * Defines supported currencies in the ZMA ecosystem.
 * Currently supports USD and VND with extensibility for additional currencies.
 *
 * @enum {string}
 */
export enum CurrencyEnum {
  /** United States Dollar */
  USD = 'USD',

  /** Vietnamese Dong */
  VND = 'VND',
}

/**
 * Currency formatting configuration
 *
 * Provides locale-specific formatting rules for each supported currency.
 * Includes symbol, precision, decimal separator, and thousand separator.
 */
export interface CurrencyFormatConfig {
  /** Currency symbol (e.g., $, ₫) */
  symbol: string;
  /** Decimal precision (number of decimal places) */
  precision: number;
  /** Decimal separator character */
  decimal: string;
  /** Thousand separator character */
  separator: string;
  /** Currency name for display */
  name: string;
  /** ISO 4217 currency code */
  code: string;
}

/**
 * Currency formatting configurations for supported currencies
 */
export const CurrencyFormat: Record<CurrencyEnum, CurrencyFormatConfig> = {
  [CurrencyEnum.VND]: {
    symbol: '₫',
    precision: 0,
    decimal: ',',
    separator: '.',
    name: 'Vietnamese Dong',
    code: 'VND',
  },
  [CurrencyEnum.USD]: {
    symbol: '$',
    precision: 2,
    decimal: '.',
    separator: ',',
    name: 'US Dollar',
    code: 'USD',
  },
};

/**
 * Type guard to check if a value is a valid CurrencyEnum
 * @param value - Value to check
 * @returns True if value is a valid CurrencyEnum
 */
export const isValidCurrency = (value: string): value is CurrencyEnum => {
  return Object.values(CurrencyEnum).includes(value as CurrencyEnum);
};

/**
 * Format an amount according to currency rules
 * @param amount - The amount to format
 * @param currency - The currency to use for formatting
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: CurrencyEnum): string => {
  const config = CurrencyFormat[currency];
  const formattedAmount = amount.toFixed(config.precision);
  const [integer, decimal] = formattedAmount.split('.');

  // Add thousand separators
  const integerWithSeparators = integer.replace(/\B(?=(\d{3})+(?!\d))/g, config.separator);

  // Combine parts
  const result = decimal
    ? `${integerWithSeparators}${config.decimal}${decimal}`
    : integerWithSeparators;

  return `${config.symbol}${result}`;
};

/**
 * Get currency symbol for a given currency
 * @param currency - The currency enum value
 * @returns Currency symbol
 */
export const getCurrencySymbol = (currency: CurrencyEnum): string => {
  return CurrencyFormat[currency].symbol;
};

/**
 * Get all supported currencies
 * @returns Array of all supported currency enum values
 */
export const getSupportedCurrencies = (): CurrencyEnum[] => {
  return Object.values(CurrencyEnum);
};
