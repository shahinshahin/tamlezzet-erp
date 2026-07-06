type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDev = import.meta.env.DEV;

const COLORS: Record<LogLevel, string> = {
  debug: '#9E9E9E',
  info:  '#2196F3',
  warn:  '#FF9800',
  error: '#F44336',
};

function log(level: LogLevel, context: string, message: string, data?: unknown) {
  if (!isDev && level === 'debug') return;

  const timestamp = new Date().toISOString();
  const prefix = `%c[${timestamp}] [${level.toUpperCase()}] [${context}]`;
  const style = `color: ${COLORS[level]}; font-weight: bold`;

  if (data !== undefined) {
    console[level === 'debug' ? 'log' : level](prefix, style, message, data);
  } else {
    console[level === 'debug' ? 'log' : level](prefix, style, message);
  }
}

export const logger = {
  debug: (context: string, message: string, data?: unknown) => log('debug', context, message, data),
  info:  (context: string, message: string, data?: unknown) => log('info',  context, message, data),
  warn:  (context: string, message: string, data?: unknown) => log('warn',  context, message, data),
  error: (context: string, message: string, data?: unknown) => log('error', context, message, data),
};
