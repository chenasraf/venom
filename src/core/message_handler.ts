import Discord from 'discord.js'
import { CHAT_TRIGGERS, COMMAND_TRIGGERS } from '@/env'
import { parseArguments, parseCommand } from '@/core/commands'
import { logger } from '@/core/logger'
import { chatterChance, trainMegahal } from '@/core/megahal'
import { isWhitelisted } from '@/lib/whitelist'
import { isAdministrator } from '@/utils/discord_utils'

export async function handleMessage(message: Discord.Message) {
  // ignore bot/own messages
  if (message.author.bot) return
  const whitelisted = await isWhitelisted('commands', message.guild!, message.channel)

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
      if (!whitelisted && !command?.global) {
        logger.debug(
          'Command received in non-whitelisted channel/guild:',
          message.channel.id,
          'guild:',
          message.guild!.id,
        )
        return
      }
      if (command?.adminOnly) {
        const isAdmin = await isAdministrator(message.member!)
        if (!isAdmin) {
          logger.debug('Non-administrator tried to use admin command:', message.author.id)
          return
        }
      }
      if (command) {
        command.execute(message, args)
      } else {
        if (cmdName) {
          message.reply(`Command not found: ${cmdName}`)
        }
      }
    }
  }

  if (!triggered) {
    const isTriggerPrefix = CHAT_TRIGGERS.some((p) => message.content.toLowerCase().startsWith(p))
    trainMegahal(message, isTriggerPrefix ? 1 : chatterChance)
  }
}
