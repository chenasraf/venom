import Discord from 'discord.js'

import { db } from '@/core/db'
import { command } from '@/core/commands'

// TODO move to types file
export interface Character {
  uid: string
  name: string
}

export default command({
  command: 'character',
  aliases: ['c'],
  description: 'Get information about your character',
  examples: ['`!character`'],
  async execute(message: Discord.Message): Promise<Discord.Message> {
    // Just testing db stuff

    const matchedChar = await db
      .collection<Character>('characters')
      .findOne({ userId: message.author.id })

    if (!matchedChar) {
      return message.reply(`Doesn't look like you have joined this campaign`)
    }

    return message.reply(`Welcome back ${matchedChar.name}`)
  },
})
