import { Message } from 'discord.js'
import path from 'node:path'
import fs from 'node:fs/promises'
import { BOT_TRIGGERS } from '@/env'

export interface Command {
  command: string
  aliases: string[]
  description: string
  execute(message: Message, args: string[]): void
}

let _commands: Record<string, Command> = {}

export async function loadCommands(): Promise<Command[]> {
  _commands = {}
  const dir = path.resolve(process.cwd(), 'src', 'commands')
  const files = await fs.readdir(dir)
  for (const file of files) {
    const command = (await import(path.resolve(dir, file))).default
    console.log('Command loaded:', command.command)
    _commands[command.command] = command
  }
  return Object.values(_commands)
}

function cleanMessage(message: string): string {
  for (const prefix of BOT_TRIGGERS) {
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
