# Sentry Integration Setup Guide

This app is integrated with Sentry for error tracking and performance monitoring in production.

## Quick Start

### 1. Create a Sentry Account

1. Go to [sentry.io](https://sentry.io)
2. Sign up for a free account
3. Create a new project
4. Select **React** as your platform

### 2. Get Your DSN

After creating a project, you'll get a **DSN (Data Source Name)**. It looks like:

```
https://abc123@o123456.ingest.sentry.io/789012
```

### 3. Configure Environment Variables

Add your Sentry DSN to your `.env` file:

```bash
# Copy .env.example to .env if you haven't already
cp .env.example .env

# Edit .env and add:
VITE_SENTRY_DSN="https://your-dsn-here@sentry.io/your-project-id"
VITE_SENTRY_ENVIRONMENT="production"  # or "staging", "development"
```

### 4. Deploy

That's it! Sentry will now automatically capture:
- ✅ Uncaught exceptions
- ✅ Promise rejections
- ✅ React component errors (via ErrorBoundary)
- ✅ API errors (via logger)
- ✅ User actions (as breadcrumbs)
- ✅ Performance metrics

## Features

### Error Tracking

All errors are automatically sent to Sentry with:
- Full stack traces
- User context (if logged in)
- Breadcrumbs (user actions before error)
- Environment details
- Release version

### Performance Monitoring

Sentry tracks:
- Page load times
- API call duration
- Component render times

Sample rate: 10% of all transactions (configurable in `src/lib/sentry.ts`)

### Session Replay

When an error occurs, Sentry captures a replay of the user's session to help debug:
- User interactions
- Console logs
- Network requests
- DOM changes

**Privacy:** All text and media are masked by default.

## Customization

### Adjust Sample Rates

Edit `src/lib/sentry.ts`:

```typescript
// Performance monitoring sample rate (0.0 to 1.0)
tracesSampleRate: 0.1,  // 10% of transactions

// Session replay rates
replaysSessionSampleRate: 0.1,    // 10% of all sessions
replaysOnErrorSampleRate: 1.0,    // 100% of error sessions
```

### Add Custom Context

```typescript
import { setUser, addBreadcrumb } from '@/lib/sentry';

// Set user context
setUser({
  id: user.id,
  email: user.email,
  username: user.displayName
});

// Add custom breadcrumb
addBreadcrumb('User clicked export button', 'user', {
  exportType: 'pdf',
  worldId: '123'
});
```

### Capture Custom Errors

```typescript
import { captureException, captureMessage } from '@/lib/sentry';

// Capture exception
try {
  // ...
} catch (error) {
  captureException(error, {
    extra: { context: 'world-generation' }
  });
}

// Capture message
captureMessage('Something unusual happened', 'warning', {
  userId: user.id
});
```

## Development Mode

Sentry is **disabled by default in development** to avoid noise.

To enable it in development:
1. Add a DSN to `.env` even in development
2. Errors will be logged to console instead of sent to Sentry

## Monitoring Dashboard

Access your Sentry dashboard at:
```
https://sentry.io/organizations/your-org/issues/
```

You'll see:
- Error frequency and trends
- Affected users
- Stack traces
- Session replays
- Performance insights

## Cost

Sentry's free tier includes:
- ✅ 5,000 errors/month
- ✅ 10,000 performance transactions/month
- ✅ 50 session replays/month
- ✅ Unlimited team members

For larger apps, paid plans start at $26/month.

## Disabling Sentry

To disable Sentry completely, simply remove or comment out the DSN in `.env`:

```bash
# VITE_SENTRY_DSN=""
```

The app will run normally without Sentry.

## Best Practices

1. **Set Release Versions**: Add `VITE_APP_VERSION` to track which version has errors
2. **Use Source Maps**: Enable in production for readable stack traces (configured automatically)
3. **Filter Noise**: Ignore non-critical errors in `src/lib/sentry.ts`
4. **Monitor Regularly**: Check Sentry weekly to catch issues early
5. **Set Alerts**: Configure email/Slack alerts for critical errors

## Troubleshooting

### No errors appearing in Sentry?

1. Check DSN is correct in `.env`
2. Verify environment is not `development` (unless DSN is set)
3. Check browser console for Sentry initialization message
4. Try manually triggering an error to test

### Too many errors?

1. Adjust `ignoreErrors` in `src/lib/sentry.ts`
2. Lower sample rates
3. Filter specific error messages in `beforeSend`

## Support

- [Sentry Documentation](https://docs.sentry.io/)
- [React Integration Guide](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
