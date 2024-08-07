import Discord, { PermissionsBitField } from 'discord.js'

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
  const displayName = message.mentions.members!.get(userId)?.nickname ?? 'Unknown'
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
