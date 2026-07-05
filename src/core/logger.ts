import { LOG_LEVEL } from '@/env'
import path from 'path'
import winston from 'winston'
import util from 'node:util'

const _logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: path.resolve(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      format: winston.format.uncolorize(),
    }),
    new winston.transports.File({
      filename: path.resolve(process.cwd(), 'logs', 'log.log'),
      level: LOG_LEVEL,
      format: winston.format.uncolorize(),
    }),
    new winston.transports.Console({
      format: winston.format.printf((i) => {
        const colorMap: Record<LogLevel, number> = {
          error: 31, // red
          warn: 33, // yellow
          info: 36, // cyan
          verbose: 32, // green
          debug: 34, // blue
          silly: 35, // magenta
        }
        const color = `\x1b[${colorMap[i.level as LogLevel]}m`
        const reset = '\x1b[0m'
        const level = `[${i.level.toUpperCase()}]`.padStart(10, ' ')
        return `${color}${level} ${i.message}${reset}`
      }),
    }),
  ],
})

export type LogLevel = 'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly'

function _log(level: LogLevel, ...message: unknown[]): void {
  const parsed =
    `[${new Date().toISOString()}] ` +
    message
      .map((x) => (typeof x === 'object' ? util.inspect(x, { depth: null }) : x?.toString()))
      .join(' ')
  if (_logger[level]) {
    _logger.log(level, parsed)
  } else {
    _logger.info(parsed)
  }
}

export function log(...message: unknown[]): void {
  _log('info', ...message)
}

export function warn(...message: unknown[]): void {
  _log('warn', ...message)
}

export function error(...message: unknown[]): void {
  _log('error', ...message)
}

export function info(...message: unknown[]): void {
  _log('info', ...message)
}
export function debug(...message: unknown[]): void {
  _log('debug', ...message)
}
export async function rotate(): Promise<void> {
  const fs = await import('fs/promises')
  const logPath = path.resolve(process.cwd(), 'logs', 'log.log')
  const errorLogPath = path.resolve(process.cwd(), 'logs', 'error.log')
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  await fs.rename(logPath, path.resolve(process.cwd(), 'logs', `log-${timestamp}.log`))
  await fs.rename(errorLogPath, path.resolve(process.cwd(), 'logs', `error-${timestamp}.log`))
}
export async function readLog(): Promise<string> {
  const fs = await import('fs/promises')
  const logPath = path.resolve(process.cwd(), 'logs', 'log.log')
  try {
    return await fs.readFile(logPath, 'utf-8')
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return ''
    }
    throw err
  }
}

export const logger = Object.assign(_log, { log, warn, error, info, debug, rotate, readLog })
