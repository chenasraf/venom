import Discord from 'discord.js'
import MegaHAL from 'megahal.js'
import { logger } from './logger'
import { CHAT_TRIGGERS } from '@/env'
import fs from 'node:fs/promises'
import path from 'node:path'
let muted = false
const BRAIN_FILE = path.resolve(process.cwd(), 'data', 'brain.dat')
// every 20 messages
const SAVE_RATE = 20
const msgCount: Record<string, number> = {}
// chance to reply - 0.05 ~ every 20 messages
export const CHATTER_REPLY_CHANCE = 0.05

logger.log('Initializing MegaHAL')
export const megahal = new MegaHAL()

fs.access(BRAIN_FILE, fs.constants.F_OK)
  .then(() => true)
  .catch(() => false)
  .then((exists) => {
    if (!exists) {
      return logger.log('Brain file not found, using default brain')
    }
    return megahal.load(BRAIN_FILE).then(() => logger.log('Brain loaded from', BRAIN_FILE))
  })

export async function saveBrain() {
  const success = await megahal.save(BRAIN_FILE)
  if (success) {
    logger.log('Brain saved to', BRAIN_FILE)
  } else {
    logger.error('Failed to save brain')
  }
  return success
}

export function setMuted(value: boolean) {
  logger.log('Setting MegaHAL mute to', value)
  muted = value
}

export function isMuted() {
  return muted
}

export function trainMegahal(message: Discord.Message, replyChance: number) {
  const key = msgCountKey(message)
  msgCount[key]! += 1
  const input = CHAT_TRIGGERS.reduce(
    (msg, trigger) =>
      msg.toLowerCase().startsWith(trigger.toLowerCase()) ? msg.substring(trigger.length) : msg,
    message.content,
  )
  logger.debug('Learning from message:', JSON.stringify(input))
  const response = megahal.reply(input)

  if (Math.random() < replyChance && !isMuted()) {
    logger.log('Chatter chance reached, replying:', JSON.stringify(response))
    message.reply(response.replace(/<error>/g, ''))
  }
  const totalMsgs = Object.values(msgCount).reduce((total, cur) => total + cur, 0)
  if (totalMsgs >= SAVE_RATE) {
    megahal.save(BRAIN_FILE).then(() => logger.log('Brain saved to', BRAIN_FILE))
    msgCount[key] = 0
  }
}

function msgCountKey(message: Discord.Message<boolean>) {
  const key = [message.guildId, message.channelId!].join(';')
  msgCount[key] ??= 0
  return key
}
