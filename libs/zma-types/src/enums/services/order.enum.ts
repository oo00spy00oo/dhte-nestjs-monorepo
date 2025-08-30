export enum OrderServiceStatus {
  New = 'NEW',
  Pending = 'PENDING',
  Confirmed = 'CONFIRMED',
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
}

export enum OrderServiceShippingStatus {
  Pending = 'PENDING',
  Processing = 'PROCESSING',
  Shipped = 'SHIPPED',
  Delivered = 'DELIVERED',
}

export enum OrderServicePaymentStatus {
  Pending = 'PENDING',
  Paid = 'PAID',
  Failed = 'FAILED',
  Refunded = 'REFUNDED',
}

export enum OrderServicePaymentMethod {
  Cod = 'COD',
  BankTransfer = 'BANK_TRANSFER',
  Cash = 'CASH',
}

export enum OrderServiceType {
  Order = 'ORDER',
  Return = 'RETURN',
  Booking = 'BOOKING',
}

export enum OrderServiceSortField {
  CreatedAt = 'createdAt',
  UpdatedAt = 'updatedAt',
  TotalAmount = 'totalAmount',
  Status = 'status',
}
