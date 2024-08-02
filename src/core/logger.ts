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
        const level = `[${i.level.toUpperCase()}]`.padStart(10, ' ')
        return `${color}${level} ${i.message}`
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

export const logger = Object.assign(_log, { log, warn, error, info, debug })
