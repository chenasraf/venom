import dotenv from 'dotenv'
import path from 'node:path'

const env = process.env.NODE_ENV || 'development'

if (env === 'development') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
}
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

export const BOT_TRIGGERS = process.env.BOT_TRIGGERS!.split("|")
export const DISCORD_APP_ID = process.env.DISCORD_APP_ID!
export const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY!
export const DISCORD_TOKEN = process.env.DISCORD_TOKEN!
export const LOG_LEVEL = process.env.LOG_LEVEL!
