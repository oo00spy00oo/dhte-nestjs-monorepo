import * as crypto from 'crypto';

import { RegisterPasswordPolicy } from '../core/inputs';
import { DurationUnit } from '../core/types';

export class CommonUtil {
  static validatePassword({
    password,
    policy,
  }: {
    password: string;
    policy: RegisterPasswordPolicy;
  }): string[] {
    const errors: string[] = [];

    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters long.`);
    }

    if (password.length > policy.maxLength) {
      errors.push(`Password must be no more than ${policy.maxLength} characters long.`);
    }

    if (policy.uppercase && !/[A-Z]/.test(password)) {
      errors.push(`Password must contain at least one uppercase letter.`);
    }

    if (policy.lowercase && !/[a-z]/.test(password)) {
      errors.push(`Password must contain at least one lowercase letter.`);
    }

    if (policy.numbers && !/[0-9]/.test(password)) {
      errors.push(`Password must contain at least one number.`);
    }

    if (policy.specialChars && !/[!@#$%^&*(),.?":{}|<>_+=~`[\]\\-]/.test(password)) {
      errors.push(`Password must contain at least one special character.`);
    }
    return errors;
  }

  static generateVerificationCode(length = 6): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    const range = max - min + 1;

    let randomNumber: number;

    // Rejection sampling to avoid modulo bias
    while (true) {
      const byteLength = Math.ceil(Math.log2(range) / 8);
      const randomBytes = crypto.randomBytes(byteLength);
      randomNumber = parseInt(randomBytes.toString('hex'), 16);
      if (randomNumber < Math.floor(256 ** byteLength / range) * range) {
        randomNumber = (randomNumber % range) + min;
        break;
      }
    }

    return randomNumber.toString().padStart(length, '0');
  }

  static parseDuration({
    duration,
    outputUnit = DurationUnit.Millisecond,
  }: {
    duration: string;
    outputUnit?: DurationUnit;
  }): number {
    const regex = /^(\d+)(ms|s|m|h|d)$/i;
    const match = duration.match(regex);

    if (!match) {
      throw new Error(`Invalid duration format: ${duration}`);
    }

    const inputValue = parseInt(match[1], 10);
    const inputUnit = match[2].toLowerCase() as DurationUnit;

    const unitToMs: Record<DurationUnit, number> = {
      ms: 1,
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    // Convert input to milliseconds first
    const valueInMs = inputValue * unitToMs[inputUnit];

    // Convert from ms to desired output unit
    return valueInMs / unitToMs[outputUnit];
  }

  static parseBooleanFromEnv(value: string): boolean {
    if (!value) return false;
    return value === 'true' || value === '1';
  }
}
