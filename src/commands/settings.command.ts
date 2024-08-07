import { command } from '@/core/commands'
import { DEFAULT_COMMAND_PREFIX } from '@/env'
import { logger } from '@/core/logger'
import { getSetting, setSetting } from '@/lib/settings'

export default command({
  command: 'settings',
  aliases: ['set', 'setting'],
  description: 'Update settings for the bot (admin only)',
  examples: [
    `\`${DEFAULT_COMMAND_PREFIX}settings <key>\` - get setting value`,
    `\`${DEFAULT_COMMAND_PREFIX}settings [-f] <key> <value>\` - set setting value. (add \`-f\` flag to force setting this key even if it doesn't exist yet).`,
  ],
  adminOnly: true,
  async execute(message, args) {
    let key: string,
      value: string | null = null,
      force = false
    if (args.length === 1) {
      key = args[0]
    } else if (args.length === 2) {
      key = args[0]
      value = args[1]
    } else if (args.length === 3) {
      if (args[0] === '-f') {
        force = true
        key = args[1]
        value = args[2]
      } else {
        return message.reply(`Invalid arguments. See \`${DEFAULT_COMMAND_PREFIX}help settings\``)
      }
    } else {
      return message.reply(`Invalid arguments. See \`${DEFAULT_COMMAND_PREFIX}help settings\``)
    }

    if (!key) {
      return message.reply(`Invalid arguments. See \`${DEFAULT_COMMAND_PREFIX}help settings\``)
    }

    if (value == null) {
      const value = await getSetting(key)
      return message.reply(`\`${key}\` is set to \`${value}\``)
    }

    if (!force) {
      const exists = await getSetting(key)
      if (!exists) {
        return message.reply(`Key \`${key}\` does not exist. Use \`-f\` to force setting this key`)
      }
    }

    await setSetting(key, value)
    logger.info(`Setting \`${key}\` updated to \`${value}\``)
    return message.reply(`Setting \`${key}\` updated to \`${value}\``)
  },
})
