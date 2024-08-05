import Discord from 'discord.js'
import { CHAT_TRIGGERS, COMMAND_TRIGGERS } from '@/env'
import { parseArguments, parseCommand } from '@/core/commands'
import { logger } from '@/core/logger'
import { CHATTER_REPLY_CHANCE, trainMegahal } from '@/core/megahal'

export async function handleMessage(message: Discord.Message) {
  // ignore bot/own messages
  if (message.author.bot) return

  logger.debug(
    'Message received:',
    JSON.stringify(message.content),
    'from',
    '@' + message.author.username,
    'in',
    message.channel.id,
    `on guild`,
    message.guild?.id,
  )
  let triggered = false

  for (const prefix of COMMAND_TRIGGERS) {
    if (message.content.startsWith(prefix)) {
      triggered = true
      logger.log('Parsing as command:', JSON.stringify(message.content))
      const [commandName] = parseArguments(message.content)
      if (!commandName) {
        return
      }
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
