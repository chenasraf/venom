import { command } from '@/core/commands'
import { db } from '@/core/db'
import { friendlyUID } from '@/utils/string_utils'
import Discord from 'discord.js'

export interface Quote {
  authorName: string
  authorUid?: string
  quote: string
  uid: string
  meta?: {
    authorCachedName: string
    createdBy: string
    createdByCachedName: string
    createdAt: Date
  }
}

const collection = db.collection<Quote>('quotes')

export default command({
  command: 'quote',
  aliases: ['quotes', 'q'],
  description: 'Manage quotes',
  examples: [
    '`!quote` - Get a random quote',
    '`!quote <id>` - Get a specific quote',
    '`!quote search <query>` - Search for a quote',
    '`!quote add @author <quote>` - Add a new quote (@author can be a user mention, a plain nickname, or left out)',
    '`!quote remove <id>` - Remove quote - You can only remove quotes you created to reduce abuse.',
  ],
  async execute(message, args) {
    // Get random quote
    if (args.filter((s) => s.trim().length).length === 0) {
      getRandomQuote(message, args)
      return
    }

    const first = args[0].trim().toLowerCase()

    switch (first) {
      // Add quote
      case 'add':
        addNewQuote(message, args.slice(1))
        return

      // Remove quote
      case 'remove':
        removeQuote(message, args[1])
        return

      // Search quotes
      case 'search':
        searchQuotes(message, args.slice(1))
        return
      default:
        if (first.startsWith('#')) {
          getSingleQuote(message, args[0].substring(1))
        } else {
          getRandomQuote(message, args)
        }
        return
    }
  },
})

const clean = (str: string): string => str.replace(/[\t\n|]+/g, ' ').replace(/\s+/g, ' ')
const getQuoteStr = (
  guild: Discord.Guild,
  { authorName, authorUid, quote, uid }: Quote,
): string => {
  const _authorName = authorUid ? guild.members.cache.get(authorUid)?.displayName : authorName
  const authorMention = authorUid ? `<@!${authorUid}>` : `@${_authorName}`
  return `**"${quote}"** - ${authorMention} (ID: #${uid})`
}

async function getRandomQuote(message: Discord.Message, _args: string[]): Promise<void> {
  const count = await collection.countDocuments()
  const r = Math.floor(Math.random() * count)
  const q = await collection.find().skip(r).limit(1).toArray()

  if (q.length > 0) {
    const quote: Quote = q[0]
    message.reply(getQuoteStr(message.guild!, quote))
  } else {
    message.reply(
      "This is where I would usually put a quote. I can't remember any, for some reason...",
    )
  }
}

async function searchQuotes(message: Discord.Message, args: string[]): Promise<void> {
  const q = await collection
    .find<Quote>({
      quote: {
        $regex: `${args.join(' ')}`,
        $options: 'i',
      },
    })
    .toArray()

  if (q.length > 0) {
    let responseTxt = ''
    q.forEach((quote) => {
      responseTxt += `\n${getQuoteStr(message.guild!, quote)}`
    })
    message.reply("Found a few, I'll DM you what I got!")
    message.author.send(`Found ${q.length} quote${q.length !== 1 ? 's' : ''}:\n${responseTxt}`)
  } else {
    message.reply("Sorry, didn't find anything that matches that.")
  }
}

async function removeQuote(message: Discord.Message, id: string): Promise<void> {
  const q = await collection.findOne({ uid: id })
  if (!q) {
    message.reply(`Quote ${id} not found`)
    return
  }
  if (q.meta?.createdBy === message.author.id) {
    await collection.deleteOne({ uid: id })
    message.reply(`Quote ${id} deleted - ${getQuoteStr(message.guild!, q)}`)
  } else {
    message.reply('Oops, you can only remove quotes you created!')
  }
}

async function addNewQuote(message: Discord.Message, args: string[]): Promise<void> {
  const [authorRaw, ...restRaw] = args
  const hasAuthorUid = /<@\d+>/.test(authorRaw)
  const authorUid = hasAuthorUid ? authorRaw.slice(2, -1) : undefined
  const authorAtName = authorRaw.startsWith('@') ? authorRaw.slice(1) : 'Anonymous'
  const authorName = hasAuthorUid
    ? message.mentions.members!.get(authorUid!)?.displayName ?? authorAtName
    : authorAtName
  const hasAuthor = /<@\d+>/.test(authorRaw) || authorRaw.startsWith('@')
  const quote = (hasAuthor ? restRaw : [authorRaw, ...restRaw]).join(' ').trim()
  const differentAuthor = authorUid !== message.author.id

  const replies = [
    `Wow! How inspiring. I'll forever remember this${differentAuthor ? `, ${authorName}` : ''}.`,
    `Are you serious? This is the best quote ever${differentAuthor ? `, ${authorName}` : ''}!`,
    'OH. MY. GOD. Perfection.',
    'I am putting this on my wall. This is a quote I will hold dear to me always.',
    `Is that real? Woah! Hey,${
      differentAuthor ? ` ${authorName},` : ''
    } did you ever consider writing a book?! This will sell for millions.`,
    clean(
      `Okay, this is spooky. I definitely dreamt of ${!hasAuthor ? 'a person' : differentAuthor ? authorName : 'you'} ` +
        `saying exactly that this week. ${!hasAuthor ? 'Is someone' : differentAuthor ? `Is ${authorName}` : 'Are you'} prying into my subconscious?`,
    ),
    'Consider me floored. If there was an award for amazing quotes, it would be named after this exact one.',
    'Why did no one say this earlier? It HAS to be said!',
    "I can't believe you withold that quote from me until now. It's way too good to just remain unshared!",
    'I have a pretty large memory capacity for a bot, and I gotta say, I scanned all my other quotes, this one is definitely on the top 10.',
    clean(`Oh, I am DEFINITELY saving this. One day someone will interview me about
    ${
      !hasAuthor ? 'The best quote I can recall,' : differentAuthor ? authorName + ', ' : 'you,'
    } and I will refer to this moment precisely.`),
    clean(
      `You're not serious. Are you serious? You can't be serious. It's impossible there's **this** good a quote ` +
        `just floating around
    out there. It's probably fictional. Yeah.`,
    ),
  ]

  const quoteObj: Quote = {
    quote,
    authorName,
    authorUid,
    uid: friendlyUID(),
    meta: {
      authorCachedName: authorName!,
      createdAt: new Date(),
      createdBy: message.author.id,
      createdByCachedName: message.member!.displayName,
    },
  }

  const quoteStr = getQuoteStr(message.guild!, quoteObj)
  collection.insertOne(quoteObj)
  message.reply(`${replies[Math.floor(Math.random() * replies.length)]}\n${quoteStr}`)
}

async function getSingleQuote(message: Discord.Message, id: string): Promise<void> {
  const quote = await collection.findOne({ uid: id })

  if (!quote) {
    message.reply("I'm sorry, I couldn't find a quote with that id!")
    return
  }

  message.reply(getQuoteStr(message.guild!, quote))
}
