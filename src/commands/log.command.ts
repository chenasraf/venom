import { command } from '@/core/commands'
import { DEFAULT_COMMAND_PREFIX } from '@/env'
import { logger } from '@/core/logger'

const ERROR = `Invalid arguments. See \`${DEFAULT_COMMAND_PREFIX}help log\``

export default command({
  command: 'log',
  aliases: ['l'],
  description: 'Manage/view logs (admin only)',
  examples: [
    `\`${DEFAULT_COMMAND_PREFIX}log view [lines=20]\` - read last [lines] lines of the log`,
    `\`${DEFAULT_COMMAND_PREFIX}log rotate - rotate the log file`,
  ],
  adminOnly: true,
  async execute(message, args) {
    let lines = 20
    let rotate = false, read = false
    const _args = args.slice()
    while (_args.length) {
      switch (_args[0]) {
        case 'view':
          read = true
          if (_args[1]) {
            lines = parseInt(_args[1]) || 20
            _args.shift()
          }
          break
        case 'rotate':
          rotate = true
          break
      }
      _args.shift()
    }

    if (rotate) {
      logger.info('Rotating log file...')
      await logger.rotate()
      return message.reply('Log file rotated.')
    }

    if (read) {
      const logContent = await logger.readLog()
      const logLines = logContent.split('\n').slice(-lines).join('\n')

      return message.reply(`Last ${lines} lines of the log:\n\`\`\`\n${logLines}\n\`\`\``,)
    }

    throw new Error(ERROR)
  },
})
