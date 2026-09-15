export type SendPixTransferInput = {
  amountCents: number;
  pixKey: string;
  pixKeyType: string;
  description: string;
};

export type SendPixTransferResult = {
  transferId: string;
  status: 'completed' | 'failed';
  failureReason?: string;
};

export interface PayoutTransferProvider {
  sendPixTransfer(input: SendPixTransferInput): Promise<SendPixTransferResult>;
}

export class FakePayoutTransferProvider implements PayoutTransferProvider {
  async sendPixTransfer(input: SendPixTransferInput): Promise<SendPixTransferResult> {
    return {
      transferId: `tr_fake_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      status: 'completed',
    };
  }
}

export const PAYOUT_TRANSFER_PROVIDER = Symbol('PAYOUT_TRANSFER_PROVIDER');
