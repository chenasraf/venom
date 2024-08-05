import Discord from 'discord.js'
import { getSetting, setSetting } from './settings'

export async function isWhitelisted(
  prefix: string,
  guild: Discord.Guild,
  channel?: Discord.Channel,
): Promise<boolean> {
  const guildValue = await getSetting<boolean | undefined>(`${prefix}.whitelist.${guild.id}`)
  if (!guildValue) {
    return false
  }
  if (!channel) return guildValue
  const channelValue = await getSetting<boolean | undefined>(
    `${prefix}.whitelist.${guild.id}.${channel.id}`,
  )
  return channelValue ?? guildValue
}

export async function whitelistChannel(
  prefix: string,
  guild: Discord.Guild,
  channel: Discord.Channel,
) {
  return setSetting(`${prefix}.whitelist.${guild.id}.${channel.id}`, true)
}

export async function whitelistGuild(prefix: string, guild: Discord.Guild) {
  return setSetting(`${prefix}.whitelist.${guild.id}`, true)
}

export async function blacklistChannel(
  prefix: string,
  guild: Discord.Guild,
  channel: Discord.Channel,
) {
  return setSetting(`${prefix}.whitelist.${guild.id}.${channel.id}`, false)
}

export async function blacklistGuild(prefix: string, guild: Discord.Guild) {
  return setSetting(`${prefix}.whitelist.${guild.id}`, false)
}
