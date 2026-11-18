export type CreatePixInput = {
  orderId: number;
  amountCents: number;
  buyerName: string;
  expiresAt: Date;
};

export type CreatePixResult = {
  provider: 'stripe' | 'mercadopago' | 'fake';
  providerChargeId: string;
  copyPaste: string;
  qrBase64?: string;
};

export interface PaymentProvider {
  createPixCharge(input: CreatePixInput): Promise<CreatePixResult>;
}

export const PAYMENT_PROVIDER = Symbol('PAYMENT_PROVIDER');
