import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService extends ConfigService {
  constructor() {
    super(); // Call the parent constructor
  }

  get getNodeEnv(): string {
    return this.get<string>('NODE_ENV', 'development');
  }

  get getJwtSecret(): string {
    return this.get<string>('JWT_SECRET', '');
  }

  get getGrpcUrl(): string {
    return this.get<string>('GRPC_URL', '0.0.0.0:5000');
  }

  get getDaprHost(): string {
    return this.get<string>('DAPR_HOST', 'localhost');
  }

  get getDaprPort(): string {
    return this.get<string>('DAPR_PORT', '3500');
  }

  get getDaprGrpcPort(): string {
    return this.get<string>('DAPR_GRPC_PORT', '50001');
  }

  get getKafkaBrokers(): string[] {
    const temp = this.get<string[] | string>('KAFKA_SERVICE_BROKERS', []);
    if (Array.isArray(temp)) {
      return temp.map((broker: string) => broker.trim());
    } else if (typeof temp === 'string' && temp.includes('[')) {
      const brokers = JSON.parse(temp);
      return brokers.map((broker: string) => broker.trim());
    }
    return [temp.trim()];
  }

  get getServiceName(): string {
    return this.get<string>('SERVICE_NAME', '');
  }

  get getServicePort(): number {
    return this.get<number>('SERVICE_PORT', 3000);
  }

  get getServiceHost(): string {
    return this.get<string>('SERVICE_HOST', '0.0.0.0');
  }

  get getAllowedOrigins(): string[] {
    return this.get<string>('ALLOWED_ORIGINS', '').split(',').filter(Boolean);
  }

  get getGrpcCartUrl(): string {
    return this.get<string>('GRPC_SERVICE_CART_URL', '');
  }

  get getGrpcProductUrl(): string {
    return this.get<string>('GRPC_SERVICE_PRODUCT_URL', '');
  }

  get getGrpcInventoryUrl(): string {
    return this.get<string>('GRPC_SERVICE_INVENTORY_URL', '');
  }

  get getGrpcVoucherUrl(): string {
    return this.get<string>('GRPC_SERVICE_VOUCHER_URL', '');
  }

  get getGrpcShippingUrl(): string {
    return this.get<string>('GRPC_SERVICE_SHIPPING_URL', '');
  }

  get getGrpcUserUrl(): string {
    return this.get<string>('GRPC_SERVICE_USER_URL', '');
  }

  get getGrpcAddressUrl(): string {
    return this.get<string>('GRPC_SERVICE_ADDRESS_URL', '');
  }

  get getGrpcApiHubUrl(): string {
    return this.get<string>('GRPC_SERVICE_API_HUB_URL', '');
  }

  get getGrpcBookingUrl(): string {
    return this.get<string>('GRPC_SERVICE_BOOKING_URL', '');
  }

  get getGrpcCampaignUrl(): string {
    return this.get<string>('GRPC_SERVICE_CAMPAIGN_URL', '');
  }

  get getGrpcCheckinUrl(): string {
    return this.get<string>('GRPC_SERVICE_CHECKIN_URL', '');
  }

  get getGrpcCheckoutUrl(): string {
    return this.get<string>('GRPC_SERVICE_CHECKOUT_URL', '');
  }

  get getGrpcClockinUrl(): string {
    return this.get<string>('GRPC_SERVICE_CLOCKIN_URL', '');
  }

  get getGrpcContentUrl(): string {
    return this.get<string>('GRPC_SERVICE_CONTENT_URL', '');
  }

  get getGrpcCourseUrl(): string {
    return this.get<string>('GRPC_SERVICE_COURSE_URL', '');
  }

  get getGrpcDictionaryUrl(): string {
    return this.get<string>('GRPC_SERVICE_DICTIONARY_URL', '');
  }

  get getGrpcEventUrl(): string {
    return this.get<string>('GRPC_SERVICE_EVENT_URL', '');
  }

  get getGrpcFeatureFlagUrl(): string {
    return this.get<string>('GRPC_SERVICE_FEATURE_FLAG_URL', '');
  }

  get getGrpcFormUrl(): string {
    return this.get<string>('GRPC_SERVICE_FORM_URL', '');
  }

  get getGrpcIpnUrl(): string {
    return this.get<string>('GRPC_SERVICE_IPN_URL', '');
  }

  get getGrpcLoyaltyUrl(): string {
    return this.get<string>('GRPC_SERVICE_LOYALTY_URL', '');
  }

  get getGrpcMembershipUrl(): string {
    return this.get<string>('GRPC_SERVICE_MEMBERSHIP_URL', '');
  }

  get getGrpcNotificationUrl(): string {
    return this.get<string>('GRPC_SERVICE_NOTIFICATION_URL', '');
  }

  get getGrpcOrderUrl(): string {
    return this.get<string>('GRPC_SERVICE_ORDER_URL', '');
  }

  get getGrpcOrganizationUrl(): string {
    return this.get<string>('GRPC_SERVICE_ORGANIZATION_URL', '');
  }

  get getGrpcPaymentUrl(): string {
    return this.get<string>('GRPC_SERVICE_PAYMENT_URL', '');
  }

  get getGrpcPointUrl(): string {
    return this.get<string>('GRPC_SERVICE_POINT_URL', '');
  }

  get getGrpcRouterUrl(): string {
    return this.get<string>('GRPC_SERVICE_ROUTER_URL', '');
  }

  get getGrpcSampleUrl(): string {
    return this.get<string>('GRPC_SERVICE_SAMPLE_URL', '');
  }

  get getGrpcSduiUrl(): string {
    return this.get<string>('GRPC_SERVICE_SDUI_URL', '');
  }

  get getGrpcStaffUrl(): string {
    return this.get<string>('GRPC_SERVICE_STAFF_URL', '');
  }

  get getGrpcStorageUrl(): string {
    return this.get<string>('GRPC_SERVICE_STORAGE_URL', '');
  }

  get getGrpcSubscriptionUrl(): string {
    return this.get<string>('GRPC_SERVICE_SUBSCRIPTION_URL', '');
  }

  get getGrpcFnsUrl(): string {
    return this.get<string>('GRPC_SERVICE_FNS_URL', '');
  }

  get getRedisHost(): string {
    return this.get<string>('REDIS_HOST', '');
  }

  get getRedisPort(): number {
    return this.get<number>('REDIS_PORT', 6379);
  }

  get getRedisPassword(): string {
    return this.get<string>('REDIS_PASSWORD', '');
  }

  get getFfmpegPath(): string {
    return this.get<string>('FFMPEG_PATH', '');
  }
}
