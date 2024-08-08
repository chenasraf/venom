import { command } from '@/core/commands'

export default command({
  command: 'see',
  aliases: ['s'],
  description: 'See your username and ID',
  examples: ['`!s`'],
  async execute(message) {
    return message.author.send(
      [
        '**Server info:**',
        `ID: ${message.guild!.id}`,
        `Name: ${message.guild!.name}`,
        '',
        '**Your info:**',
        `ID: ${message.author.id}`,
        `Username: ${message.author.username}`,
        `Nickname: ${message.member?.nickname ?? 'Unknown'}`,
      ].join('\n'),
    )
  },
})
