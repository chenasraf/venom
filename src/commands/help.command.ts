import Discord from 'discord.js'
import { command, commands } from '@/core/commands'
import { DEFAULT_COMMAND_PREFIX } from '@/env'
import { logger } from '@/core/logger'

interface HelpMessage {
  command: string
  description: string
}

export default command({
  command: 'help',
  aliases: ['h'],
  description: 'Lists available commands and their usage.',
  examples: ['`!help`', '`!help ping`', '`!help chat`'],
  async execute(message, args) {
    let output = ''
    const data: HelpMessage[] = []
    const name = args[0]

    const commandList = Object.values(commands()).filter((c) =>
      name
        ? c.command.toLowerCase() === name.toLowerCase() ||
          c.aliases.some((a) => a.toLowerCase() === name.toLowerCase())
        : true,
    )

    for (const cmd of commandList) {
      let description = `\`${DEFAULT_COMMAND_PREFIX}${cmd.command}\``

      if (cmd.description) {
        const wrapped = cmd.description.replace(/\n/g, '\n\t\t\t')
        description += ` - ${wrapped}`
      }
      if (cmd.aliases) {
        description += `\n\t\t*Aliases:* \`${DEFAULT_COMMAND_PREFIX}${cmd.aliases.join(
          `\`, \`${DEFAULT_COMMAND_PREFIX}`,
        )}\``
      }

      if (name) {
        cmd.examples.forEach((example) => {
          description += `\n\t\t\t*e.g.:* ${example}`
        })
      } else {
        description += `\n\t\t\tFor examples, use \`!help ${cmd.command}\`.`
      }

      data.push({ command: name, description })
    }

    if (!data.length) {
      return message.reply(`I couldn't find any command with the name ${name}.`)
    }

    if (name) {
      output += `Here's what I know about the ${name} command:`
    } else {
      output += "Here's a list of all my commands:\n"
      output += `You can send \`${DEFAULT_COMMAND_PREFIX}help [command name]\` to get info on a specific command.`
    }
    output += '\n'
    for (const line of data) {
      output += `\n${line.description}\n`
    }
    try {
      if (
        [
          Discord.ChannelType.PublicThread,
          Discord.ChannelType.PrivateThread,
          Discord.ChannelType.DM,
        ].includes(message.channel.type)
      ) {
        return message.reply(output)
      }

      // const thread = await message.startThread({
      //   name: name ? `Help with ${name}` : 'Help',
      //   autoArchiveDuration: 60,
      // })
      logger.info(`Sending help DM to ${message.author.tag}.\n`, output)
      return message.reply(output)
    } catch (error) {
      logger.error(`Could not send help DM to ${message.author.tag}.\n`, error)
      return message.reply(output)
    }
  },
})
