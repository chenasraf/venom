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
  action: 'add' | 'remove' | undefined,
  type: 'guild' | 'channel' | undefined,
  gulid: Discord.Guild,
  channel?: Discord.Channel,
): Promise<string> {
  if (!action || !['add', 'remove'].includes(action)) {
    return 'You need to provide an action to whitelist, either "add" or "remove"'
  }
  if (!type || !['guild', 'channel'].includes(type)) {
    return 'You need to provide a type to whitelist, either "guild" or "channel"'
  }

  const actionMap = {
    add: whitelist,
    remove: blacklist,
  } as const

  if (type === 'guild') {
    actionMap[action](prefix, gulid)
    return `Guild ${gulid.toString()} ${action === 'add' ? 'whitelisted' : 'blacklisted'} for ${prefix}`
  } else {
    if (!channel) return 'You need to provide a channel to whitelist'
    actionMap[action](prefix, gulid, channel)
    return `Channel ${channel.toString()} on ${gulid.toString()} ${action === 'add' ? 'whitelisted' : 'blacklisted'} for ${prefix}`
  }
}
