import { Client, Events, GatewayIntentBits } from 'discord.js'
import { DISCORD_TOKEN } from '@/env'
import { loadCommands } from '@/core/commands'
import { logger } from '@/core/logger'
import { handleMessage } from '@/core/message_handler'
import { saveBrain } from '@/core/megahal'

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

function terminator(signal: string) {
  process.once(signal, async (code: string | number | Error) => {
    logger.warn(`Received ${signal}, shutting down...`)
    await saveBrain()
    process.exit(isNaN(+code) ? 1 : +code)
  })
}

// prettier-ignore
const signals = [
  'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS', 'SIGFPE', 'SIGUSR1',
  'SIGSEGV', 'SIGUSR2', 'SIGTERM', 'beforeExit', 'exit',
]
for (const sig of signals) {
  terminator(sig)
}
