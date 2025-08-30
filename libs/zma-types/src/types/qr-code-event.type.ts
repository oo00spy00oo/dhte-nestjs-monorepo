export type QrCodeEventType = {
  userId: string;
  eventId: string;
  tenantId: string;
  exp?: number;
  iat?: number;
};

export class QrCodeEvent {
  static encode(input: QrCodeEventType): string {
    return (
      input.userId.toString() +
      input.eventId.toString() +
      input.tenantId.toString() +
      (input.exp ? input.exp.toString() : '') +
      (input.iat ? input.iat.toString() : '')
    );
  }

  static decode(code: string): QrCodeEventType {
    return {
      userId: code.slice(0, 36),
      eventId: code.slice(36, 72),
      tenantId: code.slice(72, 108),
      exp: parseInt(code.slice(108, 120), 10) || undefined,
      iat: parseInt(code.slice(120, 132), 10) || undefined,
    };
  }
}
