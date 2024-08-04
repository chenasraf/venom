import { command } from '@/core/commands'
import { DEFAULT_COMMAND_PREFIX } from '@/env'
import Discord from 'discord.js'

export default command({
  command: '8ball',
  aliases: ['eightball', 'magicball', 'ball', 'wisdomball'],
  description: 'Ask the magic eightball for advice.',
  examples: [`\`${DEFAULT_COMMAND_PREFIX}8ball will I be awesome today?\``],
  async execute(message: Discord.Message, args: string[]): Promise<Discord.Message> {
    if (args.length === 0) {
      return message.reply("where's the question?")
    }

    const responses = [
      'As I see it, yes.',
      'Err, ask again later.',
      'Better not tell you now.',
      "That's hard to predict right now.",
      'Concentrate... and ask again.',
      "Don't count on it.",
      'It is certain.',
      'It is decidedly so, yes.',
      'Most likely.',
      'No.',
      'Likely not.',
      'My sources say no.',
      'Hmm, outlook not so good.',
      'Okay, outlook is good.',
      'Not sure, ask again later.',
      'As dubealex commands it: maybe!',
      "Googliano'd the answer and uh, it's a yes?",
      'Careful, but yes',
      'Signs point to a yes.',
      'Very doubtful, very doubtful.',
      'Without a doubt.',
      'Yes.',
      'YES!',
      'Yes - definitely.',
      'Yeah, you can rely on it.',
    ]

    return message.reply(responses[Math.floor(Math.random() * responses.length - 1)])
  },
})
