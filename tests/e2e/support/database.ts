import { PrismaClient } from '@prisma/client';

/**
 * Helper class for database operations in tests
 * Used for cleaning up test data and seeding test data
 */
export class DatabaseHelper {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Cleanup all test data for a specific user email
   * This will delete all related data (rentals, consumptions, payments, invoices, etc.)
   */
  async cleanupTestData(userEmail: string): Promise<void> {
    try {
      // Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email: userEmail },
        include: {
          rentals: {
            include: {
              consumptions: true,
              invoices: {
                include: {
                  payments: true,
                },
              },
              payments: true,
            },
          },
          managedProperties: {
            include: {
              rentals: true,
              electricityBills: {
                include: {
                  serviceCharges: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        return; // User doesn't exist, nothing to clean
      }

      const userId = user.id;

      // Delete payments associated with user's rentals/invoices
      for (const rental of user.rentals) {
        // Delete payments for invoices
        for (const invoice of rental.invoices) {
          await this.prisma.payment.deleteMany({
            where: { invoiceId: invoice.id },
          });
        }
        // Delete payments for rental
        await this.prisma.payment.deleteMany({
          where: { rentalId: rental.id },
        });
        // Delete invoices
        await this.prisma.invoice.deleteMany({
          where: { rentalId: rental.id },
        });
        // Delete consumptions
        await this.prisma.consumption.deleteMany({
          where: { rentalId: rental.id },
        });
      }

      // Delete rentals
      await this.prisma.rental.deleteMany({
        where: { userId },
      });

      // Delete properties managed by user
      for (const property of user.managedProperties) {
        // Delete electricity bills and service charges
        for (const bill of property.electricityBills) {
          await this.prisma.serviceCharges.deleteMany({
            where: { electricityBillId: bill.id },
          });
        }
        await this.prisma.electricityBill.deleteMany({
          where: { propertyId: property.id },
        });
        // Delete rentals associated with property
        await this.prisma.rental.deleteMany({
          where: { propertyId: property.id },
        });
      }

      // Delete properties where user is administrator
      await this.prisma.property.deleteMany({
        where: {
          administrators: {
            some: {
              id: userId,
            },
          },
        },
      });

      // Delete user accounts (OAuth)
      await this.prisma.account.deleteMany({
        where: { userId },
      });

      // Delete verification tokens
      await this.prisma.verificationToken.deleteMany({
        where: { identifier: userEmail },
      });

      // Finally, delete the user (if it still exists)
      try {
        await this.prisma.user.delete({
          where: { id: userId },
        });
      } catch (error) {
        // User might already be deleted, ignore P2025 error
        if (error && typeof error === 'object' && 'code' in error) {
          const prismaError = error as { code: string };
          if (prismaError.code !== 'P2025') {
            throw error;
          }
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error(`Error cleaning up test data for ${userEmail}:`, error);
      throw error;
    }
  }

  /**
   * Cleanup all test data (use with caution)
   * This will delete all users with test email pattern
   */
  async cleanupAllTestData(): Promise<void> {
    const testEmailPattern = /@test\.(com|local)$/i;

    const testUsers = await this.prisma.user.findMany({
      where: {
        email: {
          contains: '@test.',
        },
      },
    });

    for (const user of testUsers) {
      await this.cleanupTestData(user.email);
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        rentals: true,
        managedProperties: true,
      },
    });
  }

  /**
   * Get property by ID
   */
  async getPropertyById(id: string) {
    return this.prisma.property.findUnique({
      where: { id },
      include: {
        administrators: true,
        rentals: true,
        electricityBills: true,
      },
    });
  }

  /**
   * Get rental by ID
   */
  async getRentalById(id: string) {
    return this.prisma.rental.findUnique({
      where: { id },
      include: {
        user: true,
        property: true,
        consumptions: true,
        invoices: true,
        payments: true,
      },
    });
  }

  /**
   * Get consumption by ID
   */
  async getConsumptionById(id: string) {
    return this.prisma.consumption.findUnique({
      where: { id },
      include: {
        rental: true,
      },
    });
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(id: string) {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: {
        rental: true,
        payments: true,
      },
    });
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id: string) {
    return this.prisma.payment.findUnique({
      where: { id },
      include: {
        rental: true,
        invoice: true,
      },
    });
  }

  /**
   * Disconnect Prisma client
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
