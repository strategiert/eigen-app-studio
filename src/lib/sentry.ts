import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry for error tracking and performance monitoring
 * Only initializes if VITE_SENTRY_DSN is provided
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development';
  const isDevelopment = import.meta.env.DEV;

  // Skip initialization if no DSN provided or in development without explicit DSN
  if (!dsn) {
    if (isDevelopment) {
      console.log('[Sentry] Skipping initialization - no DSN provided');
    }
    return false;
  }

  try {
    Sentry.init({
      dsn,
      environment,

      // Performance Monitoring
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],

      // Performance monitoring sample rate
      // 1.0 = 100% of transactions, 0.1 = 10%
      tracesSampleRate: isDevelopment ? 1.0 : 0.1,

      // Session Replay sample rate
      // Captures 10% of all sessions, 100% of error sessions
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,

      // Don't send errors in development unless explicitly enabled
      enabled: !isDevelopment || Boolean(dsn),

      // Capture unhandled promise rejections
      autoSessionTracking: true,

      // Ignore specific errors
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        'chrome-extension://',
        'moz-extension://',
        // Network errors that we can't control
        'Network request failed',
        'Failed to fetch',
        // ResizeObserver errors (common, harmless)
        'ResizeObserver loop limit exceeded',
      ],

      // Custom error filtering
      beforeSend(event, hint) {
        // Don't send errors in development
        if (isDevelopment && !dsn) {
          console.log('[Sentry] Would send error:', event);
          return null;
        }

        // Filter out specific error messages
        const error = hint.originalException;
        if (error instanceof Error) {
          // Don't send certain non-critical errors
          if (error.message.includes('ResizeObserver')) {
            return null;
          }
        }

        return event;
      },

      // Add release version if available
      release: import.meta.env.VITE_APP_VERSION || 'development',
    });

    console.log(`[Sentry] Initialized in ${environment} mode`);
    return true;
  } catch (error) {
    console.error('[Sentry] Failed to initialize:', error);
    return false;
  }
}

/**
 * Capture a custom exception
 */
export function captureException(error: Error | unknown, context?: Record<string, unknown>) {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture a custom message
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, unknown>) {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    return;
  }

  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Set user context for better error tracking
 */
export function setUser(user: { id: string; email?: string; username?: string } | null) {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    return;
  }

  Sentry.setUser(user);
}

/**
 * Add breadcrumb for tracking user actions
 */
export function addBreadcrumb(message: string, category: string, data?: Record<string, unknown>) {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    return;
  }

  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}

/**
 * Start a performance transaction
 */
export function startTransaction(name: string, op: string) {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    return null;
  }

  return Sentry.startTransaction({
    name,
    op,
  });
}

// Export Sentry for advanced usage
export { Sentry };
