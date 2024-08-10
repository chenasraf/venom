import { logger } from '@/core/logger'
import Discord, { PermissionsBitField } from 'discord.js'

export const MENTION_REGEX = /<@!?(\d+)>/g

export async function isAdministrator(member: Discord.GuildMember): Promise<boolean> {
  // TODO check role permissions
  return member.permissions.has(PermissionsBitField.Flags.ManageGuild)
}

/**
 * Gets username from mention.
 *
 * If clean is true (default), will try to fetch nickname from CA style - "Real Name (Nickname)"
 */
export function getMentionUsername(message: Discord.Message, userId: string, clean = true): string {
  logger.debug('getMentionUsername', {
    userId,
    mentions: message.mentions.members!.toJSON(),
    userMention: message.mentions.members!.get(userId),
  })
  const mention = message.mentions.members!.get(userId)
  const displayName = mention?.nickname ?? mention?.displayName ?? 'Unknown'
  if (clean) {
    const startParenIdx = displayName.indexOf('(')
    const endParenIdx = displayName.indexOf(')')
    if (startParenIdx !== -1 && endParenIdx !== -1) {
      return displayName.substring(startParenIdx + 1, endParenIdx)
    }
    return displayName
  }
  return displayName
}

export function replaceUserMentions(message: Discord.Message, content: string): string {
  return content.replace(MENTION_REGEX, (_, id) => getMentionUsername(message, id))
}
