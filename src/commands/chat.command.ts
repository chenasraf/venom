import { command } from '@/core/commands'
import { logger } from '@/core/logger'
import { megahal } from '@/core/megahal'
import { BOT_PREFIX } from '@/env'

export default command({
  command: 'chat',
  aliases: ['c'],
  description: 'Chat with the bot',
  examples: [`${BOT_PREFIX}chat Hello!`],
  execute: async (message, args) => {
    if (!args.length) {
      message.reply('You need to provide a message to chat with me!')
      return
    }
    const input = args.join(' ')
    logger.log('Generating response for', JSON.stringify(input))
    const response = megahal.reply(input)
    message.reply(response)
  },
})
