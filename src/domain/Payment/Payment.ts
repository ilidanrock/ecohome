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
    // Validar que amount > 0
    if (amount <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }

    // Validar que tiene relación con Rental O Invoice (no ambos, no ninguno)
    if (!rentalId && !invoiceId) {
      throw new Error('Payment must be related to either a Rental or an Invoice');
    }

    if (rentalId && invoiceId) {
      throw new Error('Payment cannot be related to both Rental and Invoice');
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
