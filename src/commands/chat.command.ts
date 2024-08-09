import { command } from '@/core/commands'
import { logger } from '@/core/logger'
import {
  chatterChance,
  getMegahalBrainSize,
  isMuted,
  megahal,
  saveBrain,
  setMuted,
} from '@/core/megahal'
import { CHAT_TRIGGERS, DEFAULT_COMMAND_PREFIX } from '@/env'
import { isWhitelisted, manipulateWhitelist } from '@/lib/whitelist'
import { isAdministrator } from '@/utils/discord_utils'

export default command({
  command: 'chat',
  aliases: ['c'],
  description:
    `Manage chatting with Venom. Venom will have a ${chatterChance * 100}% (around every ` +
    `${Math.round(1 / chatterChance)} messages) chance to reply to any incoming message on ` +
    `a channel unless muted. To change this value, contact the one of the server staff.\n` +
    'Muting completely disables chatting, to avoid bugs relating to infinite triggers, or any other reason.',
  examples: [
    `\`${DEFAULT_COMMAND_PREFIX}chat mute\` - shuts him up`,
    `\`${DEFAULT_COMMAND_PREFIX}chat unmute\` - unmutes him`,
    `\`${DEFAULT_COMMAND_PREFIX}chat save\` - backs up the brain immediately`,
    `\`${DEFAULT_COMMAND_PREFIX}chat size\` - shows the current brain size`,
    `\`${DEFAULT_COMMAND_PREFIX}chat <anything else>\` - chat with Venom and immediately get a reply.`,
    `\`${CHAT_TRIGGERS[1]}hi!\` - You can also just prefix it with one of the chat prefixes to chat more naturally: \`${CHAT_TRIGGERS.join('`, `')}\`, `,
    `\`${DEFAULT_COMMAND_PREFIX}chat whitelist <get|add|remove> <guild|channel>\` - get/update whitelist for ` +
      `guild/channel (see \`${DEFAULT_COMMAND_PREFIX}help whitelist\` for more information (admins only).`,
    `\`${DEFAULT_COMMAND_PREFIX}chat train <lines>\` - feed megahal multiple lines to train (admins only)`,
  ],
  execute: async (message, args) => {
    if (!args.length) {
      message.reply('You need to provide a message to chat with me!')
      return
    }
    const [sub] = args
    switch (sub.toLowerCase()) {
      case 'whitelist': {
        const action = args[1]?.trim().toLowerCase() as 'get' | 'add' | 'remove' | undefined
        const type = args[2]?.trim().toLowerCase() as 'guild' | 'channel' | undefined
        message.reply(
          await manipulateWhitelist('chat', action, type, message.guild!, message.channel),
        )
        break
      }
      case 'mute':
        setMuted(true)
        message.reply('I am now muted')
        break
      case 'unmute':
        setMuted(false)
        message.reply('I am now unmuted')
        break
      case 'save': {
        const isAdmin = await isAdministrator(message.member!)
        if (!isAdmin) {
          message.reply('You are not allowed to do that!')
          break
        }
        const success = await saveBrain()
        if (success) {
          const size = await getMegahalBrainSize('string')
          message.reply(`Brain saved successfully. File size: ${size}`)
        } else {
          message.reply('Failed to save brain')
        }
        break
      }
      case 'train': {
        const isAdmin = await isAdministrator(message.member!)
        if (!isAdmin) {
          message.reply('You are not allowed to do that!')
          break
        }
        const lines = args
          .slice(1)
          .join(' ')
          .split('\n')
          .map((x) => x.trim())
          .filter(Boolean)
        await megahal.train(lines)
        message.reply('Trained successfully')
        break
      }
      case 'size': {
        const size = await getMegahalBrainSize('string')
        message.reply(`Brain size: ${size}`)
        break
      }

      default: {
        const input = args.join(' ')
        const whitelisted = await isWhitelisted('chat', message.guild!, message.channel)
        if (!isMuted() && whitelisted) {
          logger.log('Generating response for', JSON.stringify(input))
          const response = megahal.reply(input)
          message.reply(response)
        }
      }
    }
  },
})
