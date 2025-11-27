import { PaymentConstants } from './PaymentConstants';
import {
  InvalidPaymentAmountError,
  InvalidPaymentDateError,
  InvalidPaymentReferenceError,
  InvalidPaymentReceiptUrlError,
  InvalidPaymentRelationshipError,
} from './errors/PaymentErrors';

export type PaymentMethod = 'YAPE' | 'CASH' | 'BANK_TRANSFER';

export class Payment {
  id: string;
  rentalId: string | null;
  invoiceId: string | null;
  amount: number;
  paidAt: Date;
  paymentMethod: PaymentMethod;
  reference: string | null;
  receiptUrl: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    amount: number,
    paidAt: Date,
    paymentMethod: PaymentMethod,
    rentalId: string | null,
    invoiceId: string | null,
    reference: string | null,
    receiptUrl: string | null,
    createdAt: Date,
    updatedAt: Date,
    id?: string
  ) {
    // Validate amount is within allowed range
    if (amount <= 0) {
      throw new InvalidPaymentAmountError('Payment amount must be greater than zero');
    }

    if (amount < PaymentConstants.MIN_AMOUNT) {
      throw new InvalidPaymentAmountError(
        `Payment amount must be at least ${PaymentConstants.MIN_AMOUNT}`
      );
    }

    if (amount > PaymentConstants.MAX_AMOUNT) {
      throw new InvalidPaymentAmountError(
        `Payment amount exceeds maximum allowed (${PaymentConstants.MAX_AMOUNT})`
      );
    }

    // Validate that paidAt is not in the future
    if (paidAt > new Date()) {
      throw new InvalidPaymentDateError('Payment date cannot be in the future');
    }

    // Validate reference length if provided
    if (reference && reference.length > PaymentConstants.MAX_REFERENCE_LENGTH) {
      throw new InvalidPaymentReferenceError(
        `Reference must be ${PaymentConstants.MAX_REFERENCE_LENGTH} characters or less`
      );
    }

    // Validate receiptUrl format if provided
    if (receiptUrl && !/^https?:\/\/.+/.test(receiptUrl)) {
      throw new InvalidPaymentReceiptUrlError('Receipt URL must be a valid HTTP/HTTPS URL');
    }

    // Validate that has relation with Rental OR Invoice (not both, not neither)
    if (!rentalId && !invoiceId) {
      throw new InvalidPaymentRelationshipError(
        'Payment must be related to either a Rental or an Invoice'
      );
    }

    if (rentalId && invoiceId) {
      throw new InvalidPaymentRelationshipError(
        'Payment cannot be related to both Rental and Invoice'
      );
    }

    this.id = id || '';
    this.rentalId = rentalId;
    this.invoiceId = invoiceId;
    this.amount = amount;
    this.paidAt = paidAt;
    this.paymentMethod = paymentMethod;
    this.reference = reference;
    this.receiptUrl = receiptUrl;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public getAmount(): number {
    return this.amount;
  }

  public getPaidAt(): Date {
    return this.paidAt;
  }

  public getPaymentMethod(): PaymentMethod {
    return this.paymentMethod;
  }

  public getRentalId(): string | null {
    return this.rentalId;
  }

  public getInvoiceId(): string | null {
    return this.invoiceId;
  }

  public getReference(): string | null {
    return this.reference;
  }

  public getReceiptUrl(): string | null {
    return this.receiptUrl;
  }

  public isRentalPayment(): boolean {
    return this.rentalId !== null;
  }

  public isServicePayment(): boolean {
    return this.invoiceId !== null;
  }
}
