import { command } from '@/core/commands'
import { db } from '@/core/db'
import { logger } from '@/core/logger'
import { DEFAULT_COMMAND_PREFIX } from '@/env'
import { getSetting } from '@/lib/settings'
import { MENTION_REGEX, getMentionUsername } from '@/utils/discord_utils'
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
    `\`${DEFAULT_COMMAND_PREFIX}quote\` - Get a random quote`,
    `\`${DEFAULT_COMMAND_PREFIX}quote <search query>\` - Get a random quote that matches your query`,
    `\`${DEFAULT_COMMAND_PREFIX}quote #<id>\` - Get a specific quote`,
    `\`${DEFAULT_COMMAND_PREFIX}quote s[earch] <query>\` - Search for a quote`,
    `\`${DEFAULT_COMMAND_PREFIX}quote c[ount]\` - See how many quotes have been stored so far!`,
    `\`${DEFAULT_COMMAND_PREFIX}quote a[dd] @author <quote>\` - Add a new quote (@author can be a user mention, a plain nickname, or left out)`,
    `\`${DEFAULT_COMMAND_PREFIX}quote r[emove] <id>\` - Remove quote - You can only remove quotes you created to reduce abuse.`,
  ],
  async execute(message, args) {
    // Get random quote
    if (args.every((s) => !s.trim().length)) {
      getRandomQuote(message, '')
      return
    }

    const first = args[0].trim().toLowerCase()

    switch (first) {
      // Add quote
      case 'add':
      case 'a':
        addNewQuote(message, args.slice(1))
        return

      // Remove quote
      case 'remove':
      case 'r':
      case 'delete':
      case 'd':
        removeQuote(message, args[1])
        return

      // Search quotes
      case 'search':
      case 's':
        searchQuotes(message, args.slice(1))
        return

      // Get quote count
      case 'count':
      case 'c':
        await countQuotes(message)
        return

      // Get single quote
      default:
        if (first.startsWith('#')) {
          getSingleQuote(message, args[0].substring(1))
        } else {
          getRandomQuote(message, args.join(' '))
        }
        return
    }
  },
})

const clean = (str: string): string => str.replace(/[\t\n|]+/g, ' ').replace(/\s+/g, ' ')
const getQuoteStr = (
  { authorName, authorUid, quote, uid }: Quote,
  useMentions: boolean,
): string => {
  const authorMention = authorUid && useMentions ? `<@${authorUid}>` : `@${authorName}`
  return `**"${quote}"** - ${authorMention} \`!q #${uid}\``
}
const getUseMention = async (): Promise<boolean> => getSetting<boolean>('chat.useMentions')

async function countQuotes(message: Discord.Message<boolean>) {
  const count = await collection.countDocuments()
  message.reply(
    `There are ${count} quotes stored. Try a random one by using \`${DEFAULT_COMMAND_PREFIX}quote\`!`,
  )
}

async function getRandomQuote(message: Discord.Message, query: string): Promise<void> {
  const count = await collection.countDocuments()
  const useMention = await getUseMention()
  let list: Quote[] = []
  let quote: Quote
  if (query) {
    list = await _searchQuotes(query)
    const r = Math.floor(Math.random() * list.length)
    quote = list[r]
  } else {
    const r = Math.floor(Math.random() * count)
    list = query ? await _searchQuotes(query) : await collection.find().skip(r).limit(1).toArray()
    quote = list[0]
  }

  if (list.length > 0) {
    message.reply(getQuoteStr(quote, useMention))
  } else {
    message.reply(
      query
        ? "Sorry, didn't find anything that matches that."
        : "This is where I would usually put a quote. I can't remember any, for some reason...",
    )
  }
}

async function searchQuotes(message: Discord.Message, args: string[]): Promise<void> {
  const results = await _searchQuotes(args.join(' '))
  const useMention = await getUseMention()

  if (results.length > 0) {
    let responseTxt = ''
    for (const quote of results) {
      responseTxt += `- ${getQuoteStr(quote, useMention)}\n`
    }
    const countStr = `${results.length} quote${results.length !== 1 ? 's' : ''}`
    message.reply(`Found ${countStr}, I'll DM you what I got!`)
    message.author.send(`Found ${countStr}:\n${responseTxt}`)
  } else {
    message.reply("Sorry, didn't find anything that matches that.")
  }
}

async function _searchQuotes(query: string): Promise<Quote[]> {
  const regex = {
    $regex: `${query}`,
    $options: 'i',
  } as const
  const results = await collection
    .find<Quote>({
      $or: [{ authorName: regex }, { quote: regex }],
    })
    .toArray()

  return results
}

async function removeQuote(message: Discord.Message, id: string): Promise<void> {
  const q = await collection.findOne({ uid: id })
  if (!q) {
    message.reply(`Quote ${id} not found`)
    return
  }
  const useMention = await getUseMention()
  if (q.meta?.createdBy === message.author.id) {
    await collection.deleteOne({ uid: id })
    message.reply(`Quote ${id} deleted - ${getQuoteStr(q, useMention)}`)
  } else {
    message.reply('Oops, you can only remove quotes you created!')
  }
}

async function addNewQuote(message: Discord.Message, args: string[]): Promise<void> {
  const [authorRaw, ...restRaw] = args
  const hasAuthorUid = MENTION_REGEX.test(authorRaw)
  const authorUid = hasAuthorUid ? authorRaw.slice(2, -1) : undefined
  const authorCleanName = authorRaw.startsWith('@') ? authorRaw.slice(1) : authorRaw
  const authorName = hasAuthorUid
    ? getMentionUsername(message, authorUid!) ?? authorCleanName
    : authorCleanName
  const hasAuthor = hasAuthorUid || authorRaw.startsWith('@')
  const quote = (hasAuthor ? restRaw : [authorRaw, ...restRaw]).join(' ').trim()
  const differentAuthor = authorUid !== message.author.id

  const replies = [
    `Wow! How inspiring. I'll forever remember this${differentAuthor ? `, ${authorName}` : ''}.`,
    `Are you serious? This is the best quote ever${differentAuthor ? `, ${authorName}` : ''}!`,
    'OH. MY. GOD. Perfection.',
    'I am putting this on my wall. This is a quote I will hold dear to me always.',
    `Is that real? Woah! Hey,${differentAuthor ? ` ${authorName},` : ''
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
    ${!hasAuthor ? 'The best quote I can recall,' : differentAuthor ? authorName + ', ' : 'you,'
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

  const useMention = await getUseMention()
  const quoteStr = getQuoteStr(quoteObj, useMention)
  collection.insertOne(quoteObj)
  logger.log('Quote added:', quoteObj)
  message.reply(`${replies[Math.floor(Math.random() * replies.length)]}\n${quoteStr}`)
}

async function getSingleQuote(message: Discord.Message, id: string): Promise<void> {
  const quote = await collection.findOne({ uid: id })

  if (!quote) {
    message.reply("I'm sorry, I couldn't find a quote with that id!")
    return
  }

  const useMention = await getUseMention()
  message.reply(getQuoteStr(quote, useMention))
}
