import { command } from '@/core/commands'
import { logger } from '@/core/logger'
import {
  CHATTER_REPLY_CHANCE,
  getMegahalBrainSize,
  isMuted,
  megahal,
  saveBrain,
  setMuted,
} from '@/core/megahal'
import { CHAT_TRIGGERS, DEFAULT_COMMAND_PREFIX } from '@/env'
import {
  blacklistChannel,
  blacklistGuild,
  isBlacklisted,
  isWhitelisted,
  whitelistChannel,
  whitelistGuild,
} from '@/lib/blacklist'
import { setSetting } from '@/lib/settings'

export default command({
  command: 'chat',
  aliases: ['c'],
  description:
    `Manage chatting with Venom. Venom will have a ${CHATTER_REPLY_CHANCE * 100}% (around every ` +
    `${Math.round(1 / CHATTER_REPLY_CHANCE)} messages) chance to reply to any incoming message on ` +
    `a channel unless muted. To change this value, contact the one of the server staff.\n` +
    'Muting completely disables chatting, to avoid bugs relating to infinite triggers, or any other reason.',
  examples: [
    `\`${DEFAULT_COMMAND_PREFIX}chat mute\` - shuts him up`,
    `\`${DEFAULT_COMMAND_PREFIX}chat unmute\` - unmutes him`,
    `\`${DEFAULT_COMMAND_PREFIX}chat save\` - backs up the brain immediately`,
    `\`${DEFAULT_COMMAND_PREFIX}chat size\` - shows the current brain size`,
    `\`${DEFAULT_COMMAND_PREFIX}chat <anything else>\` - chat with Venom and immediately get a reply.`,
    `\`${CHAT_TRIGGERS[1]}hi!\` - You can also just prefix it with one of the chat prefixes to chat more naturally: \`${CHAT_TRIGGERS.join('`, `')}\`, `,
  ],
  execute: async (message, args) => {
    if (!args.length) {
      message.reply('You need to provide a message to chat with me!')
      return
    }
    const [sub] = args
    switch (sub.toLowerCase()) {
      case 'whitelist': {
        const guild = message.guild!
        const channel = message.channel!
        const type = args[1]?.trim().toLowerCase()
        if (!type || !['guild', 'channel'].includes(type)) {
          return message.reply(
            'You need to provide a type to whitelist, either "guild" or "channel"',
          )
        }
        if (type === 'guild') {
          await whitelistGuild('chat', guild)
          logger.info(`Whitelisted guild ${guild.id}`)
          message.reply(`Guild ${guild.toString()} whitelisted`)
        } else {
          logger.info(`Whitelisting channel ${channel.id} in guild ${guild.id}`)
          await whitelistChannel('chat', guild, channel)
          message.reply(`Channel ${channel.toString()} on ${guild.toString()} whitelisted`)
        }
        break
      }
      case 'blacklist': {
        const guild = message.guild!
        const channel = message.channel!
        const type = args[1]?.trim().toLowerCase()
        if (!type || !['guild', 'channel'].includes(type)) {
          return message.reply(
            'You need to provide a type to blacklist, either "guild" or "channel"',
          )
        }
        if (type === 'guild') {
          await blacklistGuild('chat', guild)
          logger.info(`Blacklisted guild ${guild.id}`)
          message.reply(`Guild ${guild.toString()} blacklisted`)
        } else {
          logger.info(`Blacklisting channel ${channel.id} in guild ${guild.id}`)
          await blacklistChannel('chat', guild, channel)
          message.reply(`Channel ${channel.toString()} on ${guild.toString()} blacklisted`)
        }
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
        const success = await saveBrain()
        if (success) {
          message.reply('Brain saved successfully')
        } else {
          message.reply('Failed to save brain')
        }
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
