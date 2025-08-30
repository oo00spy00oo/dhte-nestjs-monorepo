/**
 * @fileoverview zma-types: Shared Type System
 *
 * This library defines a unified type system used across all applications and libraries.
 * It ensures type consistency and reduces duplication of interfaces and enums.
 *
 * Key Features:
 * - Shared Enums: Centralized enum definitions (e.g., UserRole, Status)
 * - GraphQL Inputs/Outputs: Type definitions for GraphQL schema inputs and responses
 * - Validation Schemas: Predefined validation rules for common data structures
 * - Service Contracts: Interface definitions for service methods
 * - Data Models: Domain entities and their relationships
 * - Type Mappers: Data transformation utilities
 *
 * @see {@link https://github.com/zma-nestjs-monorepo/docs/shared-libraries#zma-types}
 */

// ==========================================
// CORE TYPE DEFINITIONS
// ==========================================

// Common GraphQL inputs and outputs used across services
export * from './common';

// Centralized enumeration types for domain concepts
export * from './enums';

// Service method signatures and communication contracts
export * from './subjects';

// General-purpose type definitions and utility types
export * from './types';

// Validation schemas and utilities
export * from './validator';

// ==========================================
// SERVICE-SPECIFIC DEFINITIONS
// ==========================================
