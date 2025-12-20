/**
 * Centralized logging utility
 * Makes it easy to replace with a proper logging service (e.g., Sentry, LogRocket)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  worldId?: string;
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext) {
    console.info(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage('warn', message, context));
    // TODO: Send to monitoring service in production
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    console.error(this.formatMessage('error', message, context));
    if (error) {
      console.error('Error details:', errorMessage);
      if (stack) console.error('Stack:', stack);
    }

    // TODO: Send to error tracking service (e.g., Sentry)
    // Example:
    // if (!this.isDevelopment) {
    //   Sentry.captureException(error, {
    //     tags: { component: context?.component, action: context?.action },
    //     extra: context
    //   });
    // }
  }

  /**
   * Log API call failures with relevant context
   */
  apiError(endpoint: string, error: unknown, context?: LogContext) {
    this.error(
      `API call failed: ${endpoint}`,
      error instanceof Error ? error : new Error(String(error)),
      { ...context, endpoint, type: 'api_error' }
    );
  }

  /**
   * Log user actions for analytics
   */
  userAction(action: string, context?: LogContext) {
    this.info(`User action: ${action}`, { ...context, type: 'user_action' });
    // TODO: Send to analytics service
  }

  /**
   * Log performance metrics
   */
  performance(metric: string, durationMs: number, context?: LogContext) {
    if (this.isDevelopment) {
      this.debug(`Performance: ${metric} took ${durationMs}ms`, context);
    }
    // TODO: Send to performance monitoring
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience function for timing operations
export async function measurePerformance<T>(
  operation: string,
  fn: () => Promise<T>,
  context?: LogContext
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    logger.performance(operation, duration, context);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logger.error(`${operation} failed after ${duration}ms`, error, context);
    throw error;
  }
}
