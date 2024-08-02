import Discord from 'discord.js'
import { BOT_TRIGGERS } from '@/env'
import { parseArguments, parseCommand } from '@/core/commands'
import { logger } from '@/core/logger'
import { CHATTER_REPLY_CHANCE, trainMegahal } from '@/core/megahal'

export function handleMessage(message: Discord.Message) {
  logger.log('Message received:', message.content, 'from', message.author.username)
  let triggered = false

  for (const prefix of BOT_TRIGGERS) {
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
    trainMegahal(message, CHATTER_REPLY_CHANCE)
  }
}
