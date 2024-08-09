import Discord from 'discord.js'
import MegaHAL from 'megahal.js'
import { logger } from './logger'
import { CHAT_TRIGGERS } from '@/env'
import path from 'node:path'
import { fileExists, getFileSize } from '@/utils/file_utils'
import { formatBytes } from '@/utils/string_utils'
import { isWhitelisted } from '@/lib/whitelist'
import { replaceUserMentions } from '@/utils/discord_utils'
import '@/lib/venom-personality'
import { getSetting } from '@/lib/settings'

//--------------------------------------------------------------------------------
// Consts
//--------------------------------------------------------------------------------

const BRAIN_FILE = path.resolve(process.cwd(), 'data', 'brain.dat')
const DEFAULT_SAVE_RATE = 20
const DEFAULT_CHATTER_CHANCE = 0.02

//--------------------------------------------------------------------------------
// Bot settings
//--------------------------------------------------------------------------------

let muted = false
const msgCount: Record<string, number> = {}
let saveRate: number = 0
let totalMsgCount = 0
export let chatterChance: number = DEFAULT_CHATTER_CHANCE

logger.log('Initializing MegaHAL')
const start = Date.now()
export const megahal = new MegaHAL('venom')
const duration = Date.now() - start
logger.log('MegaHAL initialized in', duration, 'ms')
loadBrain()

async function loadBrain() {
  saveRate = (await getSetting<number>('chat.brainSaveRate')) ?? DEFAULT_SAVE_RATE
  chatterChance = (await getSetting<number>('chat.chatterChance')) ?? DEFAULT_CHATTER_CHANCE

  const exists = await fileExists(BRAIN_FILE)

  if (!exists) {
    return logger.log('Brain file not found, using default brain')
  }
  return megahal.load(BRAIN_FILE).then(() => logger.log('Brain loaded from', BRAIN_FILE))
}

export async function saveBrain() {
  const success = await megahal.save(BRAIN_FILE)
  if (success) {
    const size = await getMegahalBrainSize('string')
    logger.log('Brain saved to', BRAIN_FILE, 'size:', size)
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
  const unprefixedInput = CHAT_TRIGGERS.reduce(
    (msg, trigger) =>
      msg.toLowerCase().startsWith(trigger.toLowerCase()) ? msg.substring(trigger.length) : msg,
    message.content,
  )
  const input = replaceUserMentions(message, unprefixedInput)
  logger.debug('Learning from message:', JSON.stringify(input))

  if (totalMsgCount >= saveRate) {
    saveBrain()
    totalMsgCount = 0
  }

  logger.debug('Total unsaved messages:', totalMsgCount)

  const response = megahal.reply(input)

  if (Math.random() < replyChance && !isMuted()) {
    const isSameAsChatter = replyChance === chatterChance
    const replyIsForced = replyChance >= 1
    const isTrigger = replyIsForced && !isSameAsChatter
    const prefix = isTrigger ? 'Manual reply triggered,' : 'Chatter chance reached,'

    logger.log(prefix, 'replying:', JSON.stringify(response))
    message.reply(response.replace(/<error>/g, ''))
    msgCount[key]! = 0
  }
}

function msgCountKey(message: Discord.Message<boolean>) {
  const key = [message.guildId, message.channelId!].join(';')
  msgCount[key] ??= 0
  return key
}
