/**
 * @fileoverview Content Validation Utilities
 *
 * This module provides custom validation constraints for content-related fields.
 * These validators ensure data integrity and security by preventing malicious
 * or inappropriate content from being processed by the system.
 */

import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Custom validator to prevent base64-encoded data in string fields
 *
 * This validator helps prevent potential security issues and data bloat
 * by ensuring that base64-encoded content (like embedded images) is not
 * included in regular text fields. Such content should be handled through
 * proper file upload mechanisms.
 *
 * @example
 * ```typescript
 * class CreatePostDto {
 *   @IsNotIncludedBase64()
 *   @IsString()
 *   content!: string;
 * }
 * ```
 */
@ValidatorConstraint({ name: 'IsNotIncludedBase64', async: false })
export class IsNotIncludedBase64Constraint implements ValidatorConstraintInterface {
  /**
   * Validates that the string value does not contain base64-encoded data
   *
   * @param value - The value to validate
   * @returns True if value is valid (no base64 data), false otherwise
   */
  validate(value: unknown): boolean {
    if (typeof value !== 'string') return false;

    // Pattern to detect base64-encoded data URIs
    const base64Pattern = /data:[a-zA-Z]+\/[a-zA-Z0-9.+-]+;base64,[^\s"]+/;
    return !base64Pattern.test(value);
  }

  /**
   * Default error message for validation failure
   *
   * @param args - Validation arguments containing field information
   * @returns Error message string
   */
  defaultMessage(args: ValidationArguments): string {
    return `Field '${args.property}' must not include base64-encoded data. Please use proper file upload mechanisms for binary content.`;
  }
}

/**
 * Decorator factory for the IsNotIncludedBase64 validator
 *
 * @param validationOptions - Optional validation configuration
 * @returns Property decorator function
 */
export function IsNotIncludedBase64(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNotIncludedBase64Constraint,
    });
  };
}

/**
 * Custom validator to ensure content length is within reasonable limits
 *
 * Prevents extremely large content that could cause performance issues
 * or exceed database limits.
 */
@ValidatorConstraint({ name: 'IsReasonableContentLength', async: false })
export class IsReasonableContentLengthConstraint implements ValidatorConstraintInterface {
  /**
   * Validates content length against reasonable limits
   *
   * @param value - The content to validate
   * @param args - Validation arguments with length constraints
   * @returns True if content length is reasonable
   */
  validate(value: unknown, args: ValidationArguments): boolean {
    if (typeof value !== 'string') return false;

    const [maxLength = 100000] = args.constraints; // Default 100KB limit
    return value.length <= maxLength;
  }

  /**
   * Default error message for content length validation
   */
  defaultMessage(args: ValidationArguments): string {
    const [maxLength = 100000] = args.constraints;
    return `Field '${args.property}' content is too large. Maximum allowed length is ${maxLength} characters.`;
  }
}

/**
 * Decorator to validate reasonable content length
 *
 * @param maxLength - Maximum allowed content length (default: 100000)
 * @param validationOptions - Optional validation configuration
 * @returns Property decorator function
 */
export function IsReasonableContentLength(
  maxLength = 100000,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [maxLength],
      validator: IsReasonableContentLengthConstraint,
    });
  };
}

/**
 * Custom validator to detect and prevent potentially malicious content
 *
 * Checks for common patterns that might indicate XSS attempts or
 * other malicious content injection.
 */
@ValidatorConstraint({ name: 'IsSecureContent', async: false })
export class IsSecureContentConstraint implements ValidatorConstraintInterface {
  private readonly dangerousPatterns = [
    /<script[^>]*>.*?<\/script>/gi, // Script tags
    /javascript:/gi, // JavaScript protocols
    /on\w+\s*=/gi, // Event handlers
    /<iframe[^>]*>.*?<\/iframe>/gi, // Iframe tags
    /<object[^>]*>.*?<\/object>/gi, // Object tags
    /<embed[^>]*>.*?<\/embed>/gi, // Embed tags
    /expression\s*\(/gi, // CSS expressions
    /vbscript:/gi, // VBScript protocols
  ];

  /**
   * Validates content for security issues
   *
   * @param value - Content to validate
   * @returns True if content appears safe
   */
  validate(value: unknown): boolean {
    if (typeof value !== 'string') return false;

    return !this.dangerousPatterns.some((pattern) => pattern.test(value));
  }

  /**
   * Default error message for insecure content
   */
  defaultMessage(args: ValidationArguments): string {
    return `Field '${args.property}' contains potentially unsafe content. Please remove any scripts, event handlers, or suspicious code.`;
  }
}

/**
 * Decorator to validate content security
 *
 * @param validationOptions - Optional validation configuration
 * @returns Property decorator function
 */
export function IsSecureContent(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsSecureContentConstraint,
    });
  };
}

/**
 * Utility function to sanitize content by removing dangerous patterns
 *
 * @param content - Content to sanitize
 * @returns Sanitized content
 */
export const sanitizeContent = (content: string): string => {
  if (!content) return content;

  let sanitized = content;

  // Remove script tags and their content
  sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');

  // Remove event handlers
  sanitized = sanitized.replace(/\son\w+\s*=[^>\s]*/gi, '');

  // Remove javascript: and vbscript: protocols
  sanitized = sanitized.replace(/(javascript|vbscript):/gi, '');

  // Remove potentially dangerous tags
  sanitized = sanitized.replace(/<(iframe|object|embed)[^>]*>.*?<\/\1>/gi, '');

  return sanitized.trim();
};

/**
 * Utility function to validate if content is safe
 *
 * @param content - Content to check
 * @returns True if content appears safe
 */
export const isContentSafe = (content: string): boolean => {
  const validator = new IsSecureContentConstraint();
  return validator.validate(content);
};

/**
 * Utility function to extract and validate URLs from content
 *
 * @param content - Content to scan for URLs
 * @returns Array of valid URLs found in content
 */
export const extractValidUrls = (content: string): string[] => {
  if (!content) return [];

  const urlPattern =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g;
  const matches = content.match(urlPattern) || [];

  return matches.filter((url) => {
    try {
      new URL(url);
      return !url.toLowerCase().includes('javascript:') && !url.toLowerCase().includes('data:');
    } catch {
      return false;
    }
  });
};
