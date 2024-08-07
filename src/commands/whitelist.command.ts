import { command } from '@/core/commands'
import { DEFAULT_COMMAND_PREFIX } from '@/env'
import { manipulateWhitelist } from '@/lib/whitelist'

export default command({
  command: 'whitelist',
  aliases: ['wl'],
  description: [
    'Whitelist a channel or guild for commands.',
    `Format is \`${DEFAULT_COMMAND_PREFIX}whitelist <get|add|remove> <channel|guild>\``,
    'If you want to whitelist a channel, you need to provide a guild as well.',
    'Whitelisting a channel will not whitelist the guild, and removing a guild from the whitelist will also remove ' +
      'the channel. Effectively, guilds can be turned off completely, while channels have to be selected to be included.',
  ].join('\n'),
  examples: [
    `\`${DEFAULT_COMMAND_PREFIX}whitelist get channel\` - get status for channel`,
    `\`${DEFAULT_COMMAND_PREFIX}whitelist add channel\` - whitelist channel`,
    `\`${DEFAULT_COMMAND_PREFIX}whitelist remoce guild\` - remove guild from whitelist`,
  ],
  global: true,
  adminOnly: true,
  async execute(message, args) {
    const action = args[0]?.trim().toLowerCase() as 'get' | 'add' | 'remove' | undefined
    const type = args[1]?.trim().toLowerCase() as 'guild' | 'channel' | undefined
    return message.reply(
      await manipulateWhitelist('commands', action, type, message.guild!, message.channel),
    )
  },
})
