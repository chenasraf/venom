import { command } from '@/core/commands'
import { db } from '@/core/db'
import Discord from 'discord.js'
import { nanoid } from 'nanoid'

export interface Quote {
  author: string
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
    '`!quote search <query>` - Search for a quote',
    '`!quote add <quote>` - Add a new quote',
    '`!quote <id>` - Get a specific quote',
  ],
  async execute(message, args) {
    // Get random quote
    if (args.filter((s) => s.trim().length).length === 0) {
      getRandomQuote(message, args)
      return
    }

    const first = args[0].trim().toLowerCase()

    switch (first) {
      // Search quotes
      case 'search':
        searchQuotes(message, args.slice(1))
        return

      // Add quote
      case 'add':
      default:
        if (first.startsWith('#')) {
          getSingleQuote(message, args)
        } else {
          addNewQuote(message, args.slice(first === 'add' ? 1 : 0))
        }
    }
  },
})

const clean = (str: string): string => str.replace(/[\t\n|]+/g, ' ').replace(/\s+/g, ' ')
const getQuoteStr = (guild: Discord.Guild, { author, quote, uid }: Quote): string =>
  `"${quote}" - ${author} (${guild.members.cache.get(uid)?.toString() ?? `(ID: #${uid})`})`

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

async function addNewQuote(message: Discord.Message, args: string[]): Promise<void> {
  const [authorRaw, ...restRaw] = args
  const hasAuthor = /<@!\d+>/.test(authorRaw) || authorRaw.startsWith('@')
  const author = hasAuthor
    ? authorRaw.startsWith('@')
      ? authorRaw.slice(1)
      : authorRaw
    : 'Anonymous'

  const differentAuthor = hasAuthor && author !== `<@!${message.author.id}>`
  const authorName = differentAuthor
    ? authorRaw.startsWith('@')
      ? authorRaw.slice(1)
      : message.mentions.guild!.members.cache.find(
        (u) => u.user.id === message.mentions.users.first()!.id,
      )?.displayName
    : message.member!.displayName
  const quote = (hasAuthor ? restRaw : [authorRaw, ...restRaw]).join(' ')

  const replies = [
    `wow! How inspiring. I'll forever remember this${differentAuthor ? `, ${author}` : ''}.`,
    `are you serious? This is the best quote ever${differentAuthor ? `, ${author}` : ''}!`,
    'OH. MY. GOD. Perfection.',
    'I am putting this on my wall. This is a quote I will hold dear to me always.',
    `is that real? Woah! Hey,${differentAuthor ? ` ${author},` : ''
    } did you ever consider writing a book?! This will sell for millions.`,
    clean(`okay, this is spooky. I definitely dreamt of ${!hasAuthor ? 'a person' : differentAuthor ? author : 'you'}
    saying exactly that this week. ${!hasAuthor ? 'Is someone' : differentAuthor ? `Is ${author}` : 'Are you'}
    prying into my subconscious?`),
    'consider me floored. If there was an award for amazing quotes, it would be named after this exact one.',
    'why did no one say this earlier? It HAS to be said!',
    "I can't believe you withold that quote from me until now. It's way too good to just remain unshared!",
    'I have a pretty large memory capacity for a bot, and I gotta say, I scanned all my other quotes, this one is definitely on the top 10.',
    clean(`Oh, I am DEFINITELY saving this. One day someone will interview me about
    ${!hasAuthor ? 'the best quote I can recall,' : differentAuthor ? author : 'you'
      } and I will refer to this moment precisely.`),
    clean(`you're not serious. Are you serious? You can't be serious. It's impossible there's **this** good a quote just floating around
    out there. It's probably fictional. Yeah.`),
  ]

  const quoteObj: Quote = {
    quote,
    author,
    uid: nanoid(),
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

async function getSingleQuote(message: Discord.Message, args: string[]): Promise<void> {
  const id = args[0].slice(1)
  const quote = await collection.findOne({ uid: id })

  if (!quote) {
    message.reply("I'm sorry, I couldn't find a quote with that id!")
    return
  }

  message.reply(getQuoteStr(message.guild!, quote))
}
