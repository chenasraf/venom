import csv from 'csv'
import fs from 'node:fs/promises'
import path from 'node:path'
import { Quote } from '@/commands/quotes.command'
import { db } from '@/core/db'
import { logger } from '@/core/logger'
import { friendlyUID } from '@/utils/string_utils'

async function run(): Promise<void> {
  const outputDir = path.join(__dirname, '..', 'outputs')
  const parse = csv.parse
  const data = await fs.readFile(path.join(outputDir, 'quotes_clean.csv'))
  parse(data, { columns: true }, async (csvErr, rows: { author: string; quote: string }[]) => {
    if (csvErr) throw csvErr
    logger.log('Start dumping...')

    try {
      await db
        .collection<Quote>('quotes')
        .insertMany(
          rows.map((row) => ({ authorName: row.author, quote: row.quote, uid: friendlyUID() })),
        )
      logger.log('Done dumping.')
      process.exit(0)
    } catch (error) {
      logger.error(error)
    }
  })
}

run()
