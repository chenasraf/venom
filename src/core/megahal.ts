import Discord from 'discord.js'
import MegaHAL from 'megahal.js'
import { logger } from './logger'
import { CHAT_TRIGGERS } from '@/env'
import path from 'node:path'
import { fileExists, getFileSize } from '@/utils/file_utils'
import { formatBytes } from '@/utils/string_utils'
import { isWhitelisted } from '@/lib/whitelist'
let muted = false
const BRAIN_FILE = path.resolve(process.cwd(), 'data', 'brain.dat')
// every 20 messages
const SAVE_RATE = 20
const msgCount: Record<string, number> = {}
let totalMsgCount = 0
// chance to reply - 0.02 ~ every 50 messages
export const CHATTER_REPLY_CHANCE = 0.02

logger.log('Initializing MegaHAL')
const start = Date.now()
export const megahal = new MegaHAL()
const duration = Date.now() - start
logger.log('MegaHAL initialized in', duration, 'ms')
loadBrain()

async function loadBrain() {
  const exists = await fileExists(BRAIN_FILE)

  if (!exists) {
    return logger.log('Brain file not found, using default brain')
  }
  return megahal.load(BRAIN_FILE).then(() => logger.log('Brain loaded from', BRAIN_FILE))
}

export async function saveBrain() {
  const success = await megahal.save(BRAIN_FILE)
  if (success) {
    logger.log('Brain saved to', BRAIN_FILE)
  } else {
    logger.error('Failed to save brain')
  }
  return success
}

// eslint-disable-next-line no-unused-vars
export async function getMegahalBrainSize(returnType: 'string'): Promise<string>
// eslint-disable-next-line no-unused-vars
export async function getMegahalBrainSize(returnType: 'number'): Promise<number>
export async function getMegahalBrainSize(
  returnType: 'number' | 'string',
): Promise<string | number> {
  const size = await getFileSize(BRAIN_FILE)
  return returnType === 'number' ? size : formatBytes(size)
}

export function setMuted(value: boolean) {
  logger.log('Setting MegaHAL mute to', value)
  muted = value
}

export function isMuted() {
  return muted
}

export async function trainMegahal(message: Discord.Message, replyChance: number) {
  const whitelisted = await isWhitelisted('chat', message.guild!, message.channel)
  if (!whitelisted) {
    logger.debug('Not whitelisted, ignoring message:', JSON.stringify(message.content))
    return
  }

  const key = msgCountKey(message)
  msgCount[key]! += 1
  totalMsgCount += 1
  const input = CHAT_TRIGGERS.reduce(
    (msg, trigger) =>
      msg.toLowerCase().startsWith(trigger.toLowerCase()) ? msg.substring(trigger.length) : msg,
    message.content,
  )
  logger.debug('Learning from message:', JSON.stringify(input))

  if (totalMsgCount >= SAVE_RATE) {
    saveBrain()
    totalMsgCount = 0
  }

  logger.debug('Total unsaved messages:', totalMsgCount)

  const response = megahal.reply(input)

  if (Math.random() < replyChance && !isMuted()) {
    logger.log('Chatter chance reached, replying:', JSON.stringify(response))
    message.reply(response.replace(/<error>/g, ''))
    msgCount[key]! = 0
  }
}

function msgCountKey(message: Discord.Message<boolean>) {
  const key = [message.guildId, message.channelId!].join(';')
  msgCount[key] ??= 0
  return key
}
