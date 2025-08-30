/**
 * @fileoverview Shared Enumeration Types
 *
 * This module exports all enumeration types used across the monorepo.
 * These enums ensure consistent naming and values for shared business logic.
 */

// ==========================================
// CORE BUSINESS ENUMS
// ==========================================

// User and authentication related enums
export * from './roles.enum';

// Organization and tenant management
export * from './organization.enum';

// ==========================================
// DOMAIN SPECIFIC ENUMS
// ==========================================

// Order and commerce
export * from './currency.enum';

// Content and media
export * from './language.enum';

// ==========================================
// SYSTEM AND INFRASTRUCTURE ENUMS
// ==========================================

// Services and features
export * from './service-name.enum';

// ==========================================
// OPERATIONAL ENUMS
// ==========================================

// Scheduling and time
export * from './day-of-week.enum';

// Security and access control
export * from './rbac.enum';

// ==========================================
// ERROR HANDLING
// ==========================================

// Comprehensive error codes for all services
export * from './error.enum';
