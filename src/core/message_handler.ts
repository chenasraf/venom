import Discord from 'discord.js'
import { CHAT_TRIGGERS, COMMAND_TRIGGERS } from '@/env'
import { parseArguments, parseCommand } from '@/core/commands'
import { logger } from '@/core/logger'
import { CHATTER_REPLY_CHANCE, trainMegahal } from '@/core/megahal'

export function handleMessage(message: Discord.Message) {
  logger.log('Message received:', message.content, 'from', message.author.username)
  let triggered = false

  for (const prefix of COMMAND_TRIGGERS) {
    if (message.content.startsWith(prefix)) {
      triggered = true
      logger.log('Command received:', message.content, 'from', message.author.username)
      const command = parseCommand(message.content)
      const [cmdName, ...args] = parseArguments(message.content)
      if (command) {
        command.execute(message, args)
      } else {
        message.reply(`Command not found: ${cmdName}`)
      }
    }
  }

  if (!triggered) {
    const isTriggerPrefix = CHAT_TRIGGERS.some((p) => message.content.toLowerCase().startsWith(p))
    trainMegahal(message, isTriggerPrefix ? 1 : CHATTER_REPLY_CHANCE)
  }
}
