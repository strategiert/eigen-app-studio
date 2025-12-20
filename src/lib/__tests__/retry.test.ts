import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { retryWithBackoff, retrySupabaseFunction } from '../retry';

describe('retryWithBackoff', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should return result on first successful attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success');

    const promise = retryWithBackoff(fn);
    const result = await promise;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('Temporary error'))
      .mockResolvedValueOnce('success');

    const promise = retryWithBackoff(fn, { maxAttempts: 3, delayMs: 1000 });

    // Fast-forward through the delay
    const resultPromise = promise;
    await vi.advanceTimersByTimeAsync(1000);
    const result = await resultPromise;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should throw after max attempts', async () => {
    const error = new Error('Persistent error');
    const fn = vi.fn().mockRejectedValue(error);

    const promise = retryWithBackoff(fn, { maxAttempts: 3, delayMs: 1000 });

    // Fast-forward through all retries
    const catchPromise = promise.catch(e => e);
    await vi.advanceTimersByTimeAsync(1000); // First retry
    await vi.advanceTimersByTimeAsync(2000); // Second retry
    const caughtError = await catchPromise;

    expect(caughtError).toBe(error);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should use exponential backoff', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('Error 1'))
      .mockRejectedValueOnce(new Error('Error 2'))
      .mockResolvedValueOnce('success');

    const promise = retryWithBackoff(fn, {
      maxAttempts: 3,
      delayMs: 1000,
      backoffMultiplier: 2
    });

    const resultPromise = promise;

    // First retry after 1000ms (1000 * 2^0)
    await vi.advanceTimersByTimeAsync(1000);

    // Second retry after 2000ms (1000 * 2^1)
    await vi.advanceTimersByTimeAsync(2000);

    const result = await resultPromise;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should not retry on non-retryable errors', async () => {
    const error = new Error('Unauthorized');
    const fn = vi.fn().mockRejectedValue(error);

    await expect(
      retryWithBackoff(fn, { maxAttempts: 3 })
    ).rejects.toThrow('Unauthorized');

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should call onRetry callback', async () => {
    const onRetry = vi.fn();
    const error = new Error('Temporary');
    const fn = vi.fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce('success');

    const promise = retryWithBackoff(fn, { onRetry, delayMs: 1000 });

    const resultPromise = promise;
    await vi.advanceTimersByTimeAsync(1000);
    await resultPromise;

    expect(onRetry).toHaveBeenCalledWith(1, error);
  });
});

describe('retrySupabaseFunction', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should return data on successful call', async () => {
    const mockInvoke = vi.fn().mockResolvedValue({
      data: { result: 'success' },
      error: null
    });

    const result = await retrySupabaseFunction(
      'test-function',
      { input: 'test' },
      mockInvoke
    );

    expect(result).toEqual({ result: 'success' });
    expect(mockInvoke).toHaveBeenCalledWith('test-function', {
      body: { input: 'test' }
    });
  });

  it('should retry on rate limit error', async () => {
    const mockInvoke = vi.fn()
      .mockResolvedValueOnce({
        data: null,
        error: new Error('rate limit exceeded')
      })
      .mockResolvedValueOnce({
        data: { result: 'success' },
        error: null
      });

    const promise = retrySupabaseFunction(
      'test-function',
      {},
      mockInvoke
    );

    const resultPromise = promise;
    await vi.advanceTimersByTimeAsync(2000);
    const result = await resultPromise;

    expect(result).toEqual({ result: 'success' });
    expect(mockInvoke).toHaveBeenCalledTimes(2);
  });

  it('should retry on timeout', async () => {
    const mockInvoke = vi.fn()
      .mockResolvedValueOnce({
        data: null,
        error: new Error('Request timed out')
      })
      .mockResolvedValueOnce({
        data: { result: 'success' },
        error: null
      });

    const promise = retrySupabaseFunction(
      'test-function',
      {},
      mockInvoke
    );

    const resultPromise = promise;
    await vi.advanceTimersByTimeAsync(2000);
    const result = await resultPromise;

    expect(result).toEqual({ result: 'success' });
  });

  it('should throw on authentication error without retry', async () => {
    const mockInvoke = vi.fn().mockResolvedValue({
      data: null,
      error: new Error('Unauthorized')
    });

    await expect(
      retrySupabaseFunction('test-function', {}, mockInvoke)
    ).rejects.toThrow('Unauthorized');

    expect(mockInvoke).toHaveBeenCalledTimes(1);
  });

  it('should throw if no data returned', async () => {
    const mockInvoke = vi.fn().mockResolvedValue({
      data: null,
      error: null
    });

    await expect(
      retrySupabaseFunction('test-function', {}, mockInvoke)
    ).rejects.toThrow('No data returned from test-function');
  });
});
