import { command } from '@/core/commands'
import { DEFAULT_COMMAND_PREFIX } from '@/env'
import { logger } from '@/core/logger'
import { getSetting, setSetting } from '@/lib/settings'

const ERROR = `Invalid arguments. See \`${DEFAULT_COMMAND_PREFIX}help settings\``

export default command({
  command: 'settings',
  aliases: ['set', 'setting'],
  description: 'Update settings for the bot (admin only)',
  examples: [
    `\`${DEFAULT_COMMAND_PREFIX}settings <key>\` - get setting value`,
    `\`${DEFAULT_COMMAND_PREFIX}settings [-f] <key> <value>\` - set setting value. (add \`-f\` flag to force setting this key even if it doesn't exist yet). Strings should be wrapped in double quotes.`,
  ],
  adminOnly: true,
  async execute(message, args) {
    let key: string | null = null,
      value: string | null = null,
      force = false
    const _args = args.slice()
    while (_args.length) {
      switch (_args[0]) {
        case '-f':
          if (key || value || force) {
            return message.reply(ERROR)
          }
          force = true
          _args.shift()
          break
        default:
          if (!key) {
            key = _args.shift()!
            if (_args.length) {
              value = _args.shift()!
              for (const _arg of _args) {
                value += ' ' + _args.shift()!
              }
            }
          }
          break
      }
    }

    if (!key) {
      return message.reply(`Invalid arguments. See \`${DEFAULT_COMMAND_PREFIX}help settings\``)
    }

    if (value == null) {
      const value = await getSetting(key)
      return message.reply(`\`${key}\` is set to \`${JSON.stringify(value)}\``)
    }

    if (!force) {
      const exists = await getSetting(key)
      if (exists === undefined) {
        return message.reply(`Key \`${key}\` does not exist. Use \`-f\` to force setting this key`)
      }
    }

    await setSetting(key, JSON.parse(value))
    logger.info(`Setting \`${key}\` updated to \`${value}\``)
    return message.reply(`Setting \`${key}\` updated to \`${value}\``)
  },
})
