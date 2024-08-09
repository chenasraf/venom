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

let start = Date.now()
logger.log('Loading commands...')
loadCommands().then((commands) => {
  const duration = Date.now() - start
  logger.log('Commands loaded:', commands.length + ',', 'took', duration, 'ms')
})

start = Date.now()
client.once(Events.ClientReady, (readyClient) => {
  const duration = Date.now() - start
  logger.log('Ready! Logged in as', readyClient.user.tag + ', ', 'took', duration, 'ms')
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
