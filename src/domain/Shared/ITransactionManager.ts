/**
 * Transaction Manager Interface
 *
 * Abstracts database transaction management to maintain DDD boundaries.
 * This interface allows the application layer to execute operations within
 * transactions without directly depending on Prisma.
 */
export interface ITransactionManager {
  /**
   * Execute a callback within a database transaction
   *
   * @param callback - Function to execute within the transaction
   * @param options - Transaction options (isolation level, timeout, etc.)
   * @returns The result of the callback execution
   */
  execute<T>(
    callback: (tx: unknown) => Promise<T>,
    options?: {
      isolationLevel?: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable';
      maxWait?: number;
      timeout?: number;
    }
  ): Promise<T>;
}
