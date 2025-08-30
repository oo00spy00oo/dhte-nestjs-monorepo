import { TokenVerifyGqlOutput } from '../services/outputs/user/auth.output';

/**
 * Authenticated user context interface
 *
 * Extends the base token verification output with additional context
 * information needed for request processing and user impersonation.
 *
 * This interface is used throughout the application to represent
 * the current authenticated user's context, including their preferences
 * and any impersonation state.
 */
export class AuthenticatedUser extends TokenVerifyGqlOutput {
  /**
   * User's preferred language for localization
   * Format: ISO 639-1 language code (e.g., 'en', 'vi', 'fr')
   */
  acceptLanguage?: string;

  /**
   * ID of the user who initiated impersonation (if applicable)
   * Present only when the current session is an impersonation session
   */
  impersonatedBy?: string;

  /**
   * Flag indicating if the current session is an impersonation
   * True when an admin/operator is impersonating another user
   */
  isImpersonation?: boolean;

  /**
   * User's timezone offset in minutes from UTC
   * Used for displaying times in user's local timezone
   */
  timezoneOffset?: number;

  /**
   * User's preferred currency for monetary displays
   * Should be one of the supported CurrencyEnum values
   */
  preferredCurrency?: string;

  /**
   * Session metadata for audit and security purposes
   */
  sessionMetadata?: {
    /** IP address of the user's request */
    ipAddress?: string;

    /** User agent string from the request */
    userAgent?: string;

    /** Session start timestamp */
    sessionStartedAt?: Date;

    /** Last activity timestamp */
    lastActivityAt?: Date;
  };
}

/**
 * Type guard to check if a user is impersonating another user
 * @param user - Authenticated user object
 * @returns True if the user is in an impersonation session
 */
export const isImpersonating = (user: AuthenticatedUser): boolean => {
  return Boolean(user.isImpersonation && user.impersonatedBy);
};

/**
 * Type guard to check if a user has valid session metadata
 * @param user - Authenticated user object
 * @returns True if user has complete session metadata
 */
export const hasValidSession = (user: AuthenticatedUser): boolean => {
  return Boolean(user.sessionMetadata?.sessionStartedAt && user.sessionMetadata?.ipAddress);
};

/**
 * Extract the effective user ID (considering impersonation)
 * @param user - Authenticated user object
 * @returns The ID of the user being impersonated, or the actual user ID
 */
export const getEffectiveUserId = (user: AuthenticatedUser): string | undefined => {
  // Return the user's ID (the same regardless of impersonation status)
  // The impersonation logic would need to be handled at a higher level
  return user.id;
};

/**
 * Extract the actual operator user ID (the one doing the impersonation)
 * @param user - Authenticated user object
 * @returns The ID of the user performing the impersonation, or undefined if not impersonating
 */
export const getOperatorUserId = (user: AuthenticatedUser): string | undefined => {
  return user.isImpersonation ? user.impersonatedBy : undefined;
};
