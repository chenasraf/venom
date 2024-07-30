import { Client, Events, GatewayIntentBits } from 'discord.js'
import { BOT_TRIGGERS, DISCORD_TOKEN } from '@/env'
import { loadCommands, parseArguments, parseCommand } from '@/core/commands'

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

loadCommands().then((commands) =>
  console.log('Commands loaded:', commands.map((c) => c.command).join(', ')),
)

client.once(Events.ClientReady, (readyClient) => {
  console.log('Ready! Logged in as', readyClient.user.tag)
  readyClient.on(Events.MessageCreate, (message) => {
    console.log('Message received:', message.content, 'from', message.author)

    for (const prefix of BOT_TRIGGERS) {
      if (message.content.startsWith(prefix)) {
        console.log('Command received:', message.content, 'from', message.author)
        const command = parseCommand(message.content)
        const [cmdName, ...args] = parseArguments(message.content)
        if (command) {
          command.execute(message, args)
        } else {
          message.reply(`Command not found: ${cmdName}`)
        }
      }
    }
  })
})

client.login(DISCORD_TOKEN)
