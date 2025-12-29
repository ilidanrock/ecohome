import { APIRequestContext, request } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export interface CreateUserData {
  name: string;
  surname: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
}

export interface CreatePropertyData {
  name: string;
  address: string;
}

export interface CreateRentalData {
  userId: string;
  propertyId: string;
  startDate: Date;
  endDate?: Date;
}

export interface CreateConsumptionData {
  rentalId: string;
  month: number;
  year: number;
  energyReading: number;
  previousReading?: number;
  meterImageUrl?: string;
}

export interface CreateElectricityBillData {
  propertyId: string;
  periodStart: Date;
  periodEnd: Date;
  totalKWh: number;
  totalCost: number;
  fileUrl?: string;
}

export interface CreatePaymentData {
  type: 'rental' | 'invoice';
  rentalId?: string;
  invoiceId?: string;
  amount: number;
  paidAt: Date;
  paymentMethod: 'YAPE' | 'CASH' | 'BANK_TRANSFER';
  reference?: string;
  receiptUrl?: string;
}

export interface LoginResponse {
  session: {
    user: {
      id: string;
      email: string;
      role: string;
    };
  };
  userId: string;
}

/**
 * Helper class for making API calls directly from tests
 * Useful for setting up test data without going through the UI
 */
export class ApiHelper {
  private baseURL: string;
  private apiContext: APIRequestContext | null = null;

  constructor(baseURL: string = 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  /**
   * Initialize API context (call this before using other methods)
   */
  async init() {
    this.apiContext = await request.newContext({
      baseURL: this.baseURL,
    });
  }

  /**
   * Cleanup API context
   */
  async cleanup() {
    if (this.apiContext) {
      await this.apiContext.dispose();
      this.apiContext = null;
    }
  }

  /**
   * Get API context (creates if not exists)
   */
  getContext(): APIRequestContext {
    if (!this.apiContext) {
      throw new Error('ApiHelper not initialized. Call init() first.');
    }
    return this.apiContext;
  }

  /**
   * Register a new user via direct database access
   * Note: For tests, we create users directly in DB to avoid email verification
   */
  async createUser(userData: CreateUserData): Promise<{ id: string; email: string }> {
    const prisma = new PrismaClient();

    try {
      // First, try to delete existing user if it exists (cleanup)
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
        include: {
          rentals: {
            include: {
              consumptions: true,
              invoices: { include: { payments: true } },
              payments: true,
            },
          },
          managedProperties: {
            include: {
              electricityBills: { include: { serviceCharges: true } },
            },
          },
        },
      });

      if (existingUser) {
        // Delete all related data
        for (const rental of existingUser.rentals) {
          const invoiceIds = rental.invoices.map((i) => i.id);
          if (invoiceIds.length > 0) {
            await prisma.payment.deleteMany({ where: { invoiceId: { in: invoiceIds } } });
          }
          await prisma.payment.deleteMany({ where: { rentalId: rental.id } });
          await prisma.invoice.deleteMany({ where: { rentalId: rental.id } });
          await prisma.consumption.deleteMany({ where: { rentalId: rental.id } });
        }
        await prisma.rental.deleteMany({ where: { userId: existingUser.id } });

        for (const property of existingUser.managedProperties) {
          const billIds = property.electricityBills.map((b) => b.id);
          if (billIds.length > 0) {
            await prisma.serviceCharges.deleteMany({
              where: { electricityBillId: { in: billIds } },
            });
          }
          await prisma.electricityBill.deleteMany({ where: { propertyId: property.id } });
          await prisma.rental.deleteMany({ where: { propertyId: property.id } });
        }
        await prisma.property.deleteMany({
          where: { administrators: { some: { id: existingUser.id } } },
        });
        await prisma.account.deleteMany({ where: { userId: existingUser.id } });
        await prisma.verificationToken.deleteMany({ where: { identifier: userData.email } });

        // Delete the user
        await prisma.user.delete({ where: { id: existingUser.id } });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user directly in database
      const user = await prisma.user.create({
        data: {
          name: userData.name,
          surname: userData.surname,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          emailVerified: new Date(), // Mark as verified for tests
        },
      });

      await prisma.$disconnect();
      return { id: user.id, email: user.email };
    } catch (error) {
      await prisma.$disconnect();
      throw new Error(
        `Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Login and get session cookie
   * Returns cookies that can be used for authenticated requests
   * Note: For NextAuth v5, we need to use the page context to get cookies
   * This method is a placeholder - tests should use AuthHelper for UI login
   * and extract cookies from page context if needed for API calls
   */
  async login(email: string, password: string): Promise<{ cookies: string[]; userId: string }> {
    // For NextAuth v5, programmatic login is complex
    // Tests should use AuthHelper.login() through page context instead
    // This method returns empty cookies - use page context for actual login
    const context = this.getContext();

    // Try to get CSRF token
    const csrfResponse = await context.get('/api/auth/csrf');
    if (!csrfResponse.ok()) {
      throw new Error('Failed to get CSRF token');
    }

    const { csrfToken } = await csrfResponse.json();

    // Attempt login via NextAuth callback
    const response = await context.post('/api/auth/callback/credentials', {
      form: {
        email,
        password,
        csrfToken,
        redirect: 'false',
      },
    });

    // Extract cookies from response
    const setCookieHeader = response.headers()['set-cookie'];
    const cookies = setCookieHeader
      ? Array.isArray(setCookieHeader)
        ? setCookieHeader
        : [setCookieHeader]
      : [];

    // Get user ID from session
    let userId = '';
    if (cookies.length > 0) {
      const sessionResponse = await context.get('/api/auth/session', {
        headers: {
          Cookie: cookies.join('; '),
        },
      });

      if (sessionResponse.ok()) {
        const sessionData = await sessionResponse.json();
        userId = sessionData?.user?.id || '';
      }
    }

    return {
      cookies,
      userId,
    };
  }

  /**
   * Create a property (requires admin authentication)
   * Note: This endpoint may not exist - you may need to create it or use direct DB access
   */
  async createProperty(
    propertyData: CreatePropertyData,
    adminCookies: string[]
  ): Promise<{ id: string }> {
    const context = this.getContext();
    const response = await context.post('/api/properties', {
      data: propertyData,
      headers: {
        Cookie: adminCookies.join('; '),
      },
    });

    if (!response.ok()) {
      const error = await response.text();
      throw new Error(`Failed to create property: ${error}`);
    }

    const data = await response.json();
    return { id: data.property?.id || data.id || '' };
  }

  /**
   * Create a rental (requires authentication)
   */
  async createRental(rentalData: CreateRentalData, cookies: string[]): Promise<{ id: string }> {
    const context = this.getContext();
    const response = await context.post('/api/rentals', {
      data: {
        ...rentalData,
        startDate: rentalData.startDate.toISOString(),
        endDate: rentalData.endDate?.toISOString(),
      },
      headers: {
        Cookie: cookies.join('; '),
      },
    });

    if (!response.ok()) {
      const error = await response.text();
      throw new Error(`Failed to create rental: ${error}`);
    }

    const data = await response.json();
    return { id: data.rental?.id || data.id || '' };
  }

  /**
   * Create a consumption record (requires admin authentication)
   * Note: Since there's no POST endpoint for consumption, we create it directly in DB
   */
  async createConsumption(
    consumptionData: CreateConsumptionData,
    cookies: string[]
  ): Promise<{ id: string }> {
    // Suppress unused parameter warning - cookies not needed for DB direct access
    void cookies;
    // Since there's no POST /api/consumption endpoint, create directly in DB
    const prisma = new PrismaClient();
    try {
      // Check if consumption already exists for this rental/month/year
      const existing = await prisma.consumption.findFirst({
        where: {
          rentalId: consumptionData.rentalId,
          month: consumptionData.month,
          year: consumptionData.year,
        },
      });

      if (existing) {
        // Update existing consumption
        const consumption = await prisma.consumption.update({
          where: { id: existing.id },
          data: {
            energyReading: consumptionData.energyReading,
            previousReading: consumptionData.previousReading || null,
            meterImageUrl: consumptionData.meterImageUrl || null,
          },
        });
        await prisma.$disconnect();
        return { id: consumption.id };
      }

      // Create new consumption
      const consumption = await prisma.consumption.create({
        data: {
          rentalId: consumptionData.rentalId,
          month: consumptionData.month,
          year: consumptionData.year,
          energyReading: consumptionData.energyReading,
          previousReading: consumptionData.previousReading || null,
          meterImageUrl: consumptionData.meterImageUrl || null,
          ocrExtracted: false,
          ocrConfidence: null,
          ocrRawText: null,
          extractedAt: null,
        },
      });
      await prisma.$disconnect();
      return { id: consumption.id };
    } catch (error) {
      await prisma.$disconnect();
      throw new Error(
        `Failed to create consumption: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Create an electricity bill (requires admin authentication)
   */
  async createElectricityBill(
    billData: CreateElectricityBillData,
    cookies: string[]
  ): Promise<{ id: string }> {
    const context = this.getContext();
    const response = await context.post('/api/electricity-bills', {
      data: {
        ...billData,
        periodStart: billData.periodStart.toISOString(),
        periodEnd: billData.periodEnd.toISOString(),
      },
      headers: {
        Cookie: cookies.join('; '),
      },
    });

    if (!response.ok()) {
      const error = await response.text();
      throw new Error(`Failed to create electricity bill: ${error}`);
    }

    const data = await response.json();
    return { id: data.electricityBill?.id || data.id || '' };
  }

  /**
   * Create a payment (requires authentication)
   */
  async createPayment(paymentData: CreatePaymentData, cookies: string[]): Promise<{ id: string }> {
    const context = this.getContext();
    const response = await context.post('/api/payments', {
      data: {
        ...paymentData,
        paidAt: paymentData.paidAt.toISOString(),
      },
      headers: {
        Cookie: cookies.join('; '),
      },
    });

    if (!response.ok()) {
      const error = await response.text();
      throw new Error(`Failed to create payment: ${error}`);
    }

    const data = await response.json();
    return { id: data.payment?.id || data.id || '' };
  }

  /**
   * Generate invoices for a property (requires admin authentication)
   */
  async generateInvoices(
    propertyId: string,
    electricityBillId: string,
    month: number,
    year: number,
    waterCost: number,
    cookies: string[]
  ): Promise<{ invoices: Array<{ id: string }> }> {
    const context = this.getContext();
    const response = await context.post('/api/invoices/generate', {
      data: {
        propertyId,
        electricityBillId,
        month,
        year,
        waterCost,
      },
      headers: {
        Cookie: cookies.join('; '),
      },
    });

    if (!response.ok()) {
      const error = await response.text();
      throw new Error(`Failed to generate invoices: ${error}`);
    }

    const data = await response.json();
    return { invoices: data.invoices || [] };
  }

  /**
   * Extract meter reading via OCR (requires admin authentication)
   */
  async extractMeterReading(
    consumptionId: string,
    imageUrl: string,
    cookies: string[]
  ): Promise<{ reading: number; confidence: number | null }> {
    const context = this.getContext();
    const response = await context.post('/api/consumption/extract-reading', {
      data: {
        consumptionId,
        imageUrl,
      },
      headers: {
        Cookie: cookies.join('; '),
      },
    });

    if (!response.ok()) {
      const error = await response.text();
      throw new Error(`Failed to extract meter reading: ${error}`);
    }

    const data = await response.json();
    return {
      reading: data.consumption?.energyReading || 0,
      confidence: data.consumption?.ocrConfidence || null,
    };
  }

  /**
   * Get consumption by ID
   */
  async getConsumption(
    consumptionId: string,
    cookies: string[]
  ): Promise<{
    id: string;
    energyReading: number;
    previousReading: number | null;
    ocrExtracted: boolean;
    ocrConfidence: number | null;
    meterImageUrl: string | null;
  }> {
    const context = this.getContext();
    const response = await context.get(`/api/consumption/${consumptionId}`, {
      headers: {
        Cookie: cookies.join('; '),
      },
    });

    if (!response.ok()) {
      const error = await response.text();
      throw new Error(`Failed to get consumption: ${error}`);
    }

    return response.json();
  }

  /**
   * Update meter reading manually (requires admin authentication)
   */
  async updateMeterReading(
    consumptionId: string,
    energyReading: number,
    cookies: string[]
  ): Promise<{ id: string }> {
    const context = this.getContext();
    const response = await context.put(`/api/consumption/${consumptionId}`, {
      data: {
        energyReading,
      },
      headers: {
        Cookie: cookies.join('; '),
      },
    });

    if (!response.ok()) {
      const error = await response.text();
      throw new Error(`Failed to update meter reading: ${error}`);
    }

    const data = await response.json();
    return { id: data.consumption?.id || data.id || '' };
  }
}
