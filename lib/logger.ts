/**
 * Structured Logging Utility
 *
 * Provides consistent, structured logging across the application.
 * Logs are formatted as JSON for easy parsing and analysis.
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogContext {
  [key: string]: unknown;
}

/**
 * Structured logger with different log levels
 */
export const logger = {
  /**
   * Log an error message
   */
  error: (message: string, context?: LogContext) => {
    const logEntry = {
      level: 'error' as LogLevel,
      message,
      timestamp: new Date().toISOString(),
      ...context,
    };
    console.error(JSON.stringify(logEntry));
  },

  /**
   * Log a warning message
   */
  warn: (message: string, context?: LogContext) => {
    const logEntry = {
      level: 'warn' as LogLevel,
      message,
      timestamp: new Date().toISOString(),
      ...context,
    };
    console.warn(JSON.stringify(logEntry));
  },

  /**
   * Log an info message
   */
  info: (message: string, context?: LogContext) => {
    const logEntry = {
      level: 'info' as LogLevel,
      message,
      timestamp: new Date().toISOString(),
      ...context,
    };
    console.info(JSON.stringify(logEntry));
  },

  /**
   * Log a debug message (only in development)
   */
  debug: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV === 'development') {
      const logEntry = {
        level: 'debug' as LogLevel,
        message,
        timestamp: new Date().toISOString(),
        ...context,
      };
      console.debug(JSON.stringify(logEntry));
    }
  },
};

export type MutationLogParams = {
  action: string;
  entityType: string;
  entityId: string;
  performedById: string;
  endpoint?: string;
  method?: string;
};

/**
 * Log a successful mutation for audit/search (action, entity, who, where).
 */
export function logMutationSuccess(params: MutationLogParams): void {
  logger.info('mutation_success', {
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    performedById: params.performedById,
    ...(params.endpoint != null && { endpoint: params.endpoint }),
    ...(params.method != null && { method: params.method }),
  });
}
