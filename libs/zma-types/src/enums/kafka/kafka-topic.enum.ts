export enum KafkaTopic {
  UserCreatedEventTopic = 'USER_CREATED_EVENT_TOPIC',
  UserActivityEventTopic = 'USER_ACTIVITY_EVENT_TOPIC',
  OrderCreatedEventTopic = 'ORDER_CREATED_EVENT_TOPIC',
  PointBalanceUpdatedEventTopic = 'POINT_BALANCE_UPDATED_EVENT_TOPIC',
  VoucherExpiredSchedulerTopic = 'VOUCHER_EXPIRED_SCHEDULER_TOPIC',
  PaymentSubscriptionStatusUpdatedEventTopic = 'PAYMENT_SUBSCRIPTION_STATUS_UPDATED_EVENT_TOPIC',
  UserForgotPasswordEventTopic = 'USER_FORGOT_PASSWORD_EVENT_TOPIC', // pragma: allowlist secret
  ProductCreatedEventTopic = 'PRODUCT_CREATED_EVENT_TOPIC',
  ProductDeletedEventTopic = 'PRODUCT_DELETED_EVENT_TOPIC',
  DictionaryCrawlWordTopic = 'DICTIONARY_CRAWL_WORD_TOPIC',
  LarvaCourseCrawlSentenceTopic = 'LARVA_COURSE_CRAWL_SENTENCE_TOPIC',
}
