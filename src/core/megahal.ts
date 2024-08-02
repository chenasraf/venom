import Discord from 'discord.js'
import MegaHAL from 'megahal.js'
import { logger } from './logger'
import { CHAT_TRIGGERS } from '@/env'
import fs from 'node:fs/promises'
import path from 'node:path'

const BRAIN_FILE = path.resolve(process.cwd(), 'data', 'brain.dat')
// every 20 messages
const SAVE_RATE = 20
let msgCount = 0
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

export function trainMegahal(message: Discord.Message, replyChance: number) {
  msgCount += 1
  const input = CHAT_TRIGGERS.reduce(
    (msg, trigger) => (msg.startsWith(trigger) ? msg.replace(trigger, '') : msg),
    message.content,
  )
  logger.debug('Learning from message:', JSON.stringify(input))
  const response = megahal.reply(input)

  if (Math.random() < replyChance) {
    logger.log('Chatter chance reached, replying:', JSON.stringify(response))
    message.reply(response.replace(/<error>/g, ''))
  }

  if (msgCount >= SAVE_RATE) {
    megahal.save(BRAIN_FILE).then(() => logger.log('Brain saved to', BRAIN_FILE))
    msgCount = 0
  }
}
