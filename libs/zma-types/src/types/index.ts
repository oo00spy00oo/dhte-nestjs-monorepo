/**
 * @fileoverview General Type Definitions
 *
 * This module contains general-purpose type definitions, utility types,
 * and domain-specific interfaces used across the monorepo.
 */

// ==========================================
// CORE SYSTEM TYPES
// ==========================================

// Authentication and user context
export * from './authenticated-user.type';

// Common utility types and enums
export * from './common.type';

// // GraphQL extensions and utilities
// export * from './custom-graphql.type';

// ==========================================
// DOMAIN TYPES
// ==========================================

// Commerce and loyalty
export * from './loyalty.type';
export * from './membership.type';
export * from './payment.type';
export * from './point.type';
export * from './subscription.type';
export * from './voucher.type';

// Marketing and campaigns
export * from './campaign.type';
export * from './survey.type';

// Content and localization
export * from './dictionary.type';

// Events and QR codes
export * from './qr-code-event.type';

// Notifications and messaging
export * from './notification.type';

// File and storage management
export * from './storage.type';
