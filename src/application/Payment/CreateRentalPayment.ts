import { IPaymentRepository } from '@/src/domain/Payment/IPaymentRepository';
import { Payment, type PaymentMethod } from '@/src/domain/Payment/Payment';
import { PrismaClient } from '@prisma/client';
import { prisma } from '@/prisma';

export class CreateRentalPayment {
  constructor(
    private paymentRepository: IPaymentRepository,
    private prismaClient: PrismaClient = prisma
  ) {}

  async execute(
    rentalId: string,
    amount: number,
    paidAt: Date,
    paymentMethod: PaymentMethod,
    reference?: string | null,
    receiptUrl?: string | null
  ): Promise<Payment> {
    // Validate that the Rental exists
    const rental = await this.prismaClient.rental.findUnique({
      where: { id: rentalId },
    });

    if (!rental) {
      throw new Error(`Rental with ID ${rentalId} not found`);
    }

    // Create Payment entity
    const now = new Date();
    const payment = new Payment(
      amount,
      paidAt,
      paymentMethod,
      rentalId,
      null, // invoiceId is null for rental payments
      reference || null,
      receiptUrl || null,
      now,
      now
    );

    // Save payment using repository
    return await this.paymentRepository.create(payment);
  }
}
