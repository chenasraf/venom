import Discord from 'discord.js'
import { command, commands } from '@/core/commands'
import { BOT_PREFIX } from '@/env'

export default command({
  command: 'help',
  aliases: ['h'],
  description: 'Lists available commands and their usage.',
  examples: ['`!help`', '`!help ping`'],

  async execute(message: Discord.Message, args: string[]): Promise<Discord.Message> {
    const data = []

    const commandList = Object.values(commands())
    if (!args || args.length === 0) {
      // Get for all commands
      data.push("here's a list of all my commands:\n")

      for (const cmd of commandList) {
        let response = `\`${BOT_PREFIX}${cmd.command}\` `
        if (cmd.description) {
          response += `**${cmd.description}** `
        }
        if (cmd.aliases) {
          response += `\n\t\t\t*alternatively:* \`${BOT_PREFIX}${cmd.aliases.join(
            `\`, \`${BOT_PREFIX}`,
          )}\``
        }
        data.push(response)

        cmd.examples.forEach((example) => {
          data.push(`\t\t\t*for example:* ${example}`)
        })

        data.push('\n')
      }
      data.push(
        `You can send \`${BOT_PREFIX}help [command name]\` to get info on a specific command!`,
      )
    } else {
      // Get description of single command
      const name = args[0].toLowerCase()
      const cmd = commandList.find(
        (cmd) => cmd.command === name || (cmd.aliases && cmd.aliases.includes(name)),
      )

      if (!cmd) {
        message.reply("that's not a valid command!")
      } else {
        data.push(`**Name:** ${cmd.command}`)

        if (cmd.aliases) {
          data.push(`**Aliases:** ${cmd.aliases.join(', ')}`)
        }

        if (cmd.description) {
          data.push(`**Description:** ${cmd.description}`)
        }
      }
    }

    try {
      return message.reply(data.join('\n'))
    } catch (error) {
      console.log('error', `Could not send help DM to ${message.author.tag}.\n`, error)

      return message.reply("it seems like I can't DM you! Do you have DMs disabled?")
    }
  },
})
