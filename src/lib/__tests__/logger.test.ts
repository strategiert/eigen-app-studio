import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, measurePerformance } from '../logger';

describe('Logger', () => {
  let consoleSpy: {
    debug: ReturnType<typeof vi.spyOn>;
    info: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    consoleSpy = {
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('debug', () => {
    it('should log debug messages in development', () => {
      logger.debug('Test debug message');
      expect(consoleSpy.debug).toHaveBeenCalled();
    });

    it('should include context in debug logs', () => {
      logger.debug('Test with context', { component: 'TestComponent' });
      expect(consoleSpy.debug).toHaveBeenCalled();
      const callArgs = consoleSpy.debug.mock.calls[0][0] as string;
      expect(callArgs).toContain('Test with context');
      expect(callArgs).toContain('TestComponent');
    });
  });

  describe('info', () => {
    it('should log info messages', () => {
      logger.info('Test info message');
      expect(consoleSpy.info).toHaveBeenCalled();
    });

    it('should format message with timestamp and level', () => {
      logger.info('Test message');
      const callArgs = consoleSpy.info.mock.calls[0][0] as string;
      expect(callArgs).toContain('[INFO]');
      expect(callArgs).toContain('Test message');
    });
  });

  describe('warn', () => {
    it('should log warning messages', () => {
      logger.warn('Test warning');
      expect(consoleSpy.warn).toHaveBeenCalled();
    });

    it('should include context', () => {
      logger.warn('Warning with context', { action: 'testAction' });
      expect(consoleSpy.warn).toHaveBeenCalled();
      const callArgs = consoleSpy.warn.mock.calls[0][0] as string;
      expect(callArgs).toContain('testAction');
    });
  });

  describe('error', () => {
    it('should log error messages', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);
      expect(consoleSpy.error).toHaveBeenCalledTimes(3); // Main message + error details + stack
    });

    it('should handle non-Error objects', () => {
      logger.error('Error occurred', 'string error');
      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it('should log without error object', () => {
      logger.error('Simple error message');
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe('apiError', () => {
    it('should log API errors with endpoint', () => {
      const error = new Error('API failed');
      logger.apiError('/api/test', error, { userId: '123' });
      expect(consoleSpy.error).toHaveBeenCalled();
      const callArgs = consoleSpy.error.mock.calls[0][0] as string;
      expect(callArgs).toContain('/api/test');
    });
  });

  describe('userAction', () => {
    it('should log user actions', () => {
      logger.userAction('button_click', { button: 'submit' });
      expect(consoleSpy.info).toHaveBeenCalled();
      const callArgs = consoleSpy.info.mock.calls[0][0] as string;
      expect(callArgs).toContain('User action: button_click');
    });
  });

  describe('performance', () => {
    it('should log performance metrics in development', () => {
      logger.performance('test_operation', 150, { component: 'Test' });
      expect(consoleSpy.debug).toHaveBeenCalled();
      const callArgs = consoleSpy.debug.mock.calls[0][0] as string;
      expect(callArgs).toContain('150ms');
    });
  });
});

describe('measurePerformance', () => {
  beforeEach(() => {
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should measure and log performance of async operations', async () => {
    const operation = async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return 'result';
    };

    const result = await measurePerformance('test_op', operation);
    expect(result).toBe('result');
  });

  it('should log errors and re-throw', async () => {
    const operation = async () => {
      throw new Error('Test error');
    };

    await expect(
      measurePerformance('failing_op', operation)
    ).rejects.toThrow('Test error');
  });
});
