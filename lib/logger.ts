/**
 * Simple logger utility for consistent logging across the app.
 * Can be configured to enable/disable logging based on environment.
 */

const isDev = process.env.NODE_ENV === 'development';
const DEBUG = process.env.DEBUG === 'true' || isDev;

type LogLevel = 'log' | 'warn' | 'error' | 'debug';

interface LoggerOptions {
  prefix?: string;
  enabled?: boolean;
}

function formatMessage(prefix: string, ...args: unknown[]): unknown[] {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 12);
  return [`[${timestamp}][${prefix}]`, ...args];
}

function createLogger(options: LoggerOptions = {}) {
  const { prefix = 'App', enabled = DEBUG } = options;

  return {
    log: (...args: unknown[]) => {
      if (enabled) {
        console.log(...formatMessage(prefix, ...args));
      }
    },
    
    warn: (...args: unknown[]) => {
      if (enabled) {
        console.warn(...formatMessage(prefix, ...args));
      }
    },
    
    error: (...args: unknown[]) => {
      // Errors always log
      console.error(...formatMessage(prefix, ...args));
    },
    
    debug: (...args: unknown[]) => {
      if (enabled && DEBUG) {
        console.debug(...formatMessage(prefix, ...args));
      }
    },
    
    // Create a child logger with a sub-prefix
    child: (subPrefix: string) => {
      return createLogger({ prefix: `${prefix}:${subPrefix}`, enabled });
    },
  };
}

// Default logger instance
export const logger = createLogger({ prefix: 'YTW' });

// Named loggers for different modules
export const dbLogger = createLogger({ prefix: 'IndexedDB' });
export const apiLogger = createLogger({ prefix: 'API' });
export const driveLogger = createLogger({ prefix: 'Drive' });

export default logger;
