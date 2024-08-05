import Discord, { PermissionsBitField } from 'discord.js'

export async function isAdministrator(member: Discord.GuildMember): Promise<boolean> {
  // TODO check role permissions
  return member.permissions.has(PermissionsBitField.Flags.ManageGuild)
}
