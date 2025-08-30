/**
 * @fileoverview Service Method Signatures and Communication Contracts
 *
 * This module defines the subject patterns used for service-to-service communication.
 * Each service exports its available methods as enumerated subjects for type-safe
 * inter-service communication via message brokers (NATS, Kafka, etc.).
 */

// ==========================================
// CORE SERVICES
// ==========================================

// User management and authentication
export * from './organization.service';
export * from './tenant.service';
export * from './user.service';

// ==========================================
// COMMERCE SERVICES
// ==========================================

// Shopping and orders
export * from './cart.service';
export * from './inventory.service';
export * from './order.service';
export * from './product.service';
export * from './shipping.service';

// Payments and subscriptions
export * from './payment.service';
export * from './subscription.service';

// ==========================================
// LOYALTY & MARKETING SERVICES
// ==========================================

// Customer engagement
export * from './campaign.service';
export * from './loyalty.service';
export * from './membership.service';
export * from './point.service';
export * from './voucher.service';

// ==========================================
// CONTENT & MEDIA SERVICES
// ==========================================

// Content management
export * from './dictionary.service';
export * from './storage.service';

// ==========================================
// OPERATIONAL SERVICES
// ==========================================

// Events and bookings
export * from './booking.service';
export * from './checkin.service';
export * from './event.service';

// System features
export * from './feature-flag.service';
export * from './fns.service';
