import Discord from 'discord.js'
import { command } from '@/core/commands'

export default command({
  command: 'ping',
  aliases: [],
  description: 'ping',
  examples: [],
  async execute(message: Discord.Message): Promise<Discord.Message> {
    return message.reply('Pong!')
  },
})
