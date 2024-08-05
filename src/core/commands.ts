import { Message } from 'discord.js'
import path from 'node:path'
import fs from 'node:fs/promises'
import { COMMAND_TRIGGERS } from '@/env'
import { logger } from './logger'

export interface Command {
  /** Command name */
  command: string
  /** Command aliases */
  aliases: string[]
  /** Command description - shown in help */
  description: string
  /** Command examples - shown in help */
  examples: string[]
  /** Global commands are available on non-whitelisted channels (default: false) */
  global?: boolean
  /** Admin-only commands are only available to whitelisted users/permissions/roles (default: false) */
  adminOnly?: boolean
  /** Function that executes the command */
  execute(_message: Message, _args: string[]): void
}

let _commands: Record<string, Command> = {}

export async function loadCommands(): Promise<Command[]> {
  _commands = {}
  const dir = path.resolve(__dirname, '..', 'commands')
  const files = await fs.readdir(dir)
  for (const file of files) {
    const command = (await import(path.resolve(dir, file))).default
    logger.debug('Command loaded:', command.command)
    _commands[command.command] = command
  }
  return Object.values(_commands)
}

function cleanMessage(message: string): string {
  for (const prefix of COMMAND_TRIGGERS) {
    if (message.startsWith(prefix)) {
      message = message.slice(prefix.length).trim()
      break
    }
  }
  return message
}

export function parseArguments(message: string): string[] {
  return cleanMessage(message).split(' ')
}

export function parseCommand(message: string): Command | null {
  const [commandName] = parseArguments(message)
  for (const command of Object.values(_commands)) {
    if (
      commandName.toLowerCase() === command.command.toLowerCase() ||
      command.aliases.map((alias) => alias.toLowerCase()).includes(commandName.toLowerCase())
    ) {
      return command
    }
  }
  return null
}

export function command(conf: Command): Command {
  return conf
}

export function commands(): Record<string, Command> {
  return _commands
}
