import { command } from '@/core/commands'
import Discord from 'discord.js'

export default command({
  command: 'see',
  aliases: ['s'],
  description: 'See your username and ID',
  examples: ['`!s`'],
  async execute(message: Discord.Message): Promise<Discord.Message> {
    return message.author.send(
      `Server: ${message.guild!.name}\nYour username: ${message.author.username}\nYour ID: ${message.author.id}`,
    )
  },
})
