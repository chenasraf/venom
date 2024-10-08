import Discord from 'discord.js'
import { getSetting, setSetting } from './settings'

export async function isWhitelisted(
  prefix: string,
  guild: Discord.Guild,
  channel?: Discord.Channel,
): Promise<boolean> {
  const guildValue = await getSetting<boolean | undefined>(guildWhitelistKey(prefix, guild))
  if (guildValue === false) {
    return false
  }
  const channelValue = channel
    ? await getSetting<boolean | undefined>(channelWhitelistKey(prefix, guild, channel))
    : undefined
  return channelValue ?? guildValue ?? false
}

export async function whitelist(prefix: string, guild: Discord.Guild, channel?: Discord.Channel) {
  const key = channel
    ? `${prefix}.whitelist.${guild.id}.${channel.id}`
    : `${prefix}.whitelist.${guild.id}`
  return setSetting(key, true)
}

export async function blacklist(prefix: string, guild: Discord.Guild, channel?: Discord.Channel) {
  const key = channel
    ? `${prefix}.whitelist.${guild.id}.${channel.id}`
    : `${prefix}.whitelist.${guild.id}`
  return setSetting(key, false)
}

export async function manipulateWhitelist(
  prefix: string,
  action: 'add' | 'remove' | 'get' | undefined,
  type: 'guild' | 'channel' | undefined,
  guild: Discord.Guild,
  channel?: Discord.Channel,
): Promise<string> {
  if (!action || !['get', 'add', 'remove'].includes(action)) {
    return 'You need to provide an action to whitelist, either "add" or "remove"'
  }
  if (!type || !['guild', 'channel'].includes(type)) {
    return 'You need to provide a type to whitelist, either "guild" or "channel"'
  }

  const actionMap = {
    add: whitelist,
    remove: blacklist,
  } as const

  if (action === 'get') {
    const whitelisted = await isWhitelisted(
      prefix,
      guild!,
      type === 'channel' ? channel : undefined,
    )
    const suffix = `is **${whitelisted ? 'whitelisted' : 'not whitelisted'}** for ${prefix}.`
    if (type === 'guild') {
      return `The guild ${guild!.toString()} ${suffix}`
    } else {
      return `The channel ${channel!.toString()} on ${guild!.toString()} ${suffix}`
    }
  }
  if (type === 'guild') {
    actionMap[action](prefix, guild)
    return `Guild ${guild.toString()} ${action === 'add' ? 'whitelisted' : 'blacklisted'} for ${prefix}`
  } else {
    if (!channel) return 'You need to provide a channel to whitelist'
    actionMap[action](prefix, guild, channel)
    return `Channel ${channel.toString()} on ${guild.toString()} ${action === 'add' ? 'whitelisted' : 'blacklisted'} for ${prefix}`
  }
}

export function channelWhitelistKey(
  prefix: string,
  guild: Discord.Guild,
  channel: Discord.Channel,
): string {
  return `${guildWhitelistKey(prefix, guild)}.${channel.id}`
}

export function guildWhitelistKey(prefix: string, guild: Discord.Guild): string {
  return `${prefix}.whitelist.${guild.id}`
}
