/**
 * Domain Types
 *
 * Core domain models and enums used throughout the application.
 * These types represent the business domain entities.
 */

/**
 * User role enum - matches Prisma schema
 */
export type Role = 'USER' | 'ADMIN' | 'NULL';

/**
 * Payment status enum - matches Prisma schema
 */
export type PaymentStatus = 'PAID' | 'UNPAID';

/**
 * Payment method enum - matches Prisma schema
 */
export type PaymentMethod = 'YAPE' | 'CASH' | 'BANK_TRANSFER';

/**
 * User interface for application use
 * This is the public-facing user type used in components and API responses
 */
export interface User {
  id: string;
  name?: string;
  surname?: string;
  email: string;
  emailVerified?: Date | null;
  image?: string | null;
  role?: Role;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Legacy role type alias for backward compatibility
 * @deprecated Use Role instead
 */
export type role = Role;
