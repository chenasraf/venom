import dotenv from 'dotenv'
import path from 'node:path'

const env = process.env.NODE_ENV || 'development'

if (env === 'development') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
}
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

export const COMMAND_TRIGGERS = process.env.COMMAND_TRIGGERS!.split('|')
export const DEFAULT_COMMAND_PREFIX = COMMAND_TRIGGERS[0]
export const CHAT_TRIGGERS = process.env.CHAT_TRIGGERS!.split('|')
export const DISCORD_APP_ID = process.env.DISCORD_APP_ID!
export const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY!
export const DISCORD_TOKEN = process.env.DISCORD_TOKEN!
export const LOG_LEVEL = process.env.LOG_LEVEL!
export const MONGODB_URI = process.env.MONGODB_URI!
