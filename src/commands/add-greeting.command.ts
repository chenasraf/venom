import { command } from '@/core/commands'
import { db } from '@/core/db'
import { DEFAULT_COMMAND_PREFIX } from '@/env'

export default command({
  command: 'addgreeting',
  aliases: ['ag', 'add-greeting'],
  description:
    'Adds a string to the list greetings used when new users connect to server! Include `{name}` in your message to replace with the new users name.',
  examples: [`\`${DEFAULT_COMMAND_PREFIX}addgreeting Welcome to the club {name}\``],
  async execute(message, args) {
    // Only certain users can use this command
    // TODO: Better handling of permissions for commands in a generic way
    const permittedRoles = new Set(['staff', 'mod', 'bot-devs'])
    const isPermitted = message.member?.roles.cache.some((r) => permittedRoles.has(r.name))

    if (!isPermitted) {
      return message.author.send("Sorry but I can't let you add greetings!")
    }

    // Can't do much without a message
    if (args.length === 0) {
      return message.author.send('When adding a greeting you need to also provide a message!')
    }

    // Check for dupes
    const greetingStr = args.join(' ')
    const collection = db.collection('greetings')
    const matchedMessages = await collection.countDocuments({ message: greetingStr })
    if (matchedMessages > 0) {
      return message.author.send('That greeting has already been added!')
    }

    const result = await collection.insertOne({ message: greetingStr })

    if (!result) {
      return message.author.send("Uh-oh! Couldn't add that greeting!")
    }

    return message.author.send("I've added the greeting you told me about!")
  },
})
