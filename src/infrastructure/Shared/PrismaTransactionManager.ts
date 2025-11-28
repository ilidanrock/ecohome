import { PrismaClient, Prisma } from '@prisma/client';
import { ITransactionManager } from '@/src/domain/Shared/ITransactionManager';
import { prisma } from '@/prisma';

/**
 * Prisma Transaction Manager Implementation
 *
 * Provides transaction management using Prisma's transaction API.
 * This implementation maintains DDD boundaries by abstracting Prisma
 * transaction details from the application layer.
 */
export class PrismaTransactionManager implements ITransactionManager {
  constructor(private prismaClient: PrismaClient = prisma) {}

  /**
   * Execute a callback within a Prisma transaction
   *
   * @param callback - Function to execute within the transaction
   * @param options - Transaction options (isolation level, timeout, etc.)
   * @returns The result of the callback execution
   */
  async execute<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: {
      isolationLevel?: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable';
      maxWait?: number;
      timeout?: number;
    }
  ): Promise<T> {
    // Prisma transaction options are passed as the second parameter
    // Only include options that are actually provided
    const transactionOptions: {
      isolationLevel?: Prisma.TransactionIsolationLevel;
      maxWait?: number;
      timeout?: number;
    } = {};

    if (options?.isolationLevel) {
      transactionOptions.isolationLevel =
        options.isolationLevel as Prisma.TransactionIsolationLevel;
    }

    if (options?.maxWait !== undefined) {
      transactionOptions.maxWait = options.maxWait;
    }

    if (options?.timeout !== undefined) {
      transactionOptions.timeout = options.timeout;
    }

    // If no options provided, pass callback only
    if (Object.keys(transactionOptions).length === 0) {
      return await this.prismaClient.$transaction(callback);
    }

    return await this.prismaClient.$transaction(callback, transactionOptions);
  }
}
