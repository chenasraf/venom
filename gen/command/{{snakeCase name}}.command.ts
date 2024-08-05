import Discord from 'discord.js'
import { command } from '@/core/commands'
import { DEFAULT_COMMAND_PREFIX } from '@/env'
import { logger } from '@/core/logger'


export default command({
  command: '{{snakeCase name}}',
  aliases: ['{{snakeCase (substring name 0 1)}}'],
  description: 'Description for the {{snakeCase name}} command',
  examples: [`\`${DEFAULT_COMMAND_PREFIX}{{snakeCase name}}\``],
  async execute(message, args) {
    logger.log('{{snakeCase name}} command executed with:', args)
    return message.reply('{{snakeCase name}} command executed with: ' + args.join(', '))
  },
})
