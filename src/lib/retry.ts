import { logger } from './logger';

interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Retry a function with exponential backoff
 * Useful for AI API calls that might fail due to rate limits or temporary errors
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
    onRetry
  } = options;

  let lastError: Error = new Error('Unknown error');

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on certain errors
      if (isNonRetryableError(lastError)) {
        logger.warn('Non-retryable error encountered', {
          error: lastError.message,
          attempt
        });
        throw lastError;
      }

      // Last attempt - throw error
      if (attempt === maxAttempts) {
        logger.error(`Failed after ${maxAttempts} attempts`, lastError);
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);

      logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`, {
        error: lastError.message,
        attempt,
        maxAttempts
      });

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt, lastError);
      }

      // Wait before retrying
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Check if error should not be retried
 */
function isNonRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();

  // Don't retry on:
  // - Authentication errors
  // - Validation errors
  // - Not found errors
  // - Unauthorized errors
  const nonRetryablePatterns = [
    'unauthorized',
    'forbidden',
    'not found',
    'invalid',
    'validation',
    'authentication',
    'bad request',
    '400',
    '401',
    '403',
    '404'
  ];

  return nonRetryablePatterns.some(pattern => message.includes(pattern));
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry specifically for Supabase function calls
 */
export async function retrySupabaseFunction<T>(
  functionName: string,
  body: unknown,
  invokeFn: (name: string, options: { body: unknown }) => Promise<{ data: T | null; error: Error | null }>
): Promise<T> {
  return retryWithBackoff(
    async () => {
      const { data, error } = await invokeFn(functionName, { body });

      if (error) {
        // Check for rate limit error
        if (error.message.includes('rate limit') || error.message.includes('429')) {
          logger.warn('Rate limit hit, will retry', { functionName });
          throw error; // Will be retried
        }

        // Check for timeout
        if (error.message.includes('timeout') || error.message.includes('timed out')) {
          logger.warn('Timeout occurred, will retry', { functionName });
          throw error; // Will be retried
        }

        // Other errors
        throw error;
      }

      if (!data) {
        throw new Error(`No data returned from ${functionName}`);
      }

      return data;
    },
    {
      maxAttempts: 3,
      delayMs: 2000, // Start with 2 seconds for API calls
      backoffMultiplier: 2,
      onRetry: (attempt, error) => {
        logger.info(`Retrying Supabase function: ${functionName}`, {
          attempt,
          error: error.message
        });
      }
    }
  );
}
