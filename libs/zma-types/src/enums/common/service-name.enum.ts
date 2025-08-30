import { registerEnumType } from '@nestjs/graphql';

/**
 * Service name enumeration for the ZMA microservices ecosystem
 *
 * This enum defines all available microservices in the monorepo.
 * Used for service discovery, routing, and inter-service communication.
 *
 * @enum {string}
 */
export enum ServiceName {
  // Core Services
  /** Authentication and authorization service */
  AUTH = 'AuthService',

  /** User management service */
  USER = 'UserService',

  /** Organization and tenant management */
  ORGANIZATION = 'OrganizationService',

  // Commerce Services
  /** Product catalog management */
  PRODUCT = 'ProductService',

  /** Shopping cart service */
  CART = 'CartService',

  /** Order processing and management */
  ORDER = 'OrderService',

  /** Inventory and stock management */
  INVENTORY = 'InventoryService',

  /** Shipping and fulfillment */
  SHIPPING = 'ShippingService',

  /** Payment processing */
  PAYMENT = 'PaymentService',

  // Customer Engagement
  /** Loyalty program management */
  LOYALTY = 'LoyaltyService',

  /** Membership management */
  MEMBERSHIP = 'MembershipService',

  /** Points and rewards system */
  POINT = 'PointService',

  /** Voucher and discount management */
  VOUCHER = 'VoucherService',

  /** Marketing campaigns */
  CAMPAIGN = 'CampaignService',

  // Operational Services
  /** Booking and reservation system */
  BOOKING = 'BookingService',

  /** Event management */
  EVENT = 'EventService',

  /** Check-in system */
  CHECKIN = 'CheckinService',

  /** Time tracking and clock-in */
  CLOCKIN = 'ClockinService',

  // Content & Media
  /** File storage and management */
  STORAGE = 'StorageService',

  /** Content management system */
  CONTENT = 'ContentService',

  /** Dictionary and localization */
  DICTIONARY = 'DictionaryService',

  // System Services
  /** Feature flag management */
  FEATURE_FLAG = 'FeatureFlagService',

  /** Subscription management */
  SUBSCRIPTION = 'SubscriptionService',

  /** Function-as-a-service utilities */
  FNS = 'FnsService',

  /** Support ticketing system */
  TICKET = 'TicketService',

  /** Learning course management */
  LARVA_COURSE = 'LarvaCourseService',
}

registerEnumType(ServiceName, {
  name: 'ServiceName',
  description: 'Available ZMA microservices for inter-service communication',
});

/**
 * Type guard to check if a value is a valid ServiceName
 * @param value - Value to check
 * @returns True if value is a valid ServiceName
 */
export const isValidServiceName = (value: string): value is ServiceName => {
  return Object.values(ServiceName).includes(value as ServiceName);
};

/**
 * Get all core business services (excluding system utilities)
 * @returns Array of core business service names
 */
export const getCoreBusinessServices = (): ServiceName[] => {
  return [
    ServiceName.AUTH,
    ServiceName.USER,
    ServiceName.ORGANIZATION,
    ServiceName.PRODUCT,
    ServiceName.CART,
    ServiceName.ORDER,
    ServiceName.INVENTORY,
    ServiceName.PAYMENT,
    ServiceName.LOYALTY,
    ServiceName.MEMBERSHIP,
    ServiceName.POINT,
    ServiceName.VOUCHER,
  ];
};

/**
 * Get all operational services
 * @returns Array of operational service names
 */
export const getOperationalServices = (): ServiceName[] => {
  return [
    ServiceName.BOOKING,
    ServiceName.EVENT,
    ServiceName.CHECKIN,
    ServiceName.CLOCKIN,
    ServiceName.STORAGE,
    ServiceName.CONTENT,
  ];
};
