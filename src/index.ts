import { Client, Events, GatewayIntentBits } from 'discord.js'
import { DISCORD_TOKEN } from '@/env'
import { loadCommands } from '@/core/commands'
import { logger } from '@/core/logger'
import { handleMessage } from '@/core/message_handler'

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

loadCommands().then((commands) =>
  logger.log('Commands loaded:', commands.map((c) => c.command).join(', ')),
)

client.once(Events.ClientReady, (readyClient) => {
  logger.log('Ready! Logged in as', readyClient.user.tag)
  readyClient.on(Events.MessageCreate, handleMessage)
})

client.login(DISCORD_TOKEN)
