/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, startCase } from 'lodash';

export class CommonUtil {
  static enumToHumanReadable({ mapping, value }: { mapping: string; value: string }) {
    return get(mapping, value) || startCase(value);
  }

  static toHumanReadable(value: string) {
    return value ? startCase(value) : value;
  }

  static validatePassword(password: string, policy: any) {
    const errors = [];

    // Length check
    if (policy.minLength && password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters long`);
    }

    // Uppercase check
    if (policy.uppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    // Lowercase check
    if (policy.lowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    // Number check
    if (policy.numbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    // Special character check
    if (policy.specialChars && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return errors;
  }

  static isValidUuid(uuid: string): boolean {
    if (!uuid || typeof uuid !== 'string') {
      return false;
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-7][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}
