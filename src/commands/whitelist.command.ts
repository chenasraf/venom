import { command } from '@/core/commands'
import { manipulateWhitelist } from '@/lib/blacklist'

export default command({
  command: 'whitelist',
  aliases: ['wl'],
  description: 'Whitelist a channel or guild for commands.',
  examples: ['`!whitelist add channel`', '`!whitelist add guild`'],
  global: true,
  adminOnly: true,
  async execute(message, args) {
    const action = args[0]?.trim().toLowerCase() as 'add' | 'remove' | undefined
    const type = args[1]?.trim().toLowerCase() as 'guild' | 'channel' | undefined
    return message.reply(
      await manipulateWhitelist('commands', action, type, message.guild!, message.channel),
    )
  },
})
