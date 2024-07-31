import csv from 'csv'
import fs from 'node:fs/promises'
import path from 'node:path'
import { Quote } from '@/commands/quotes.command'
import { nanoid } from 'nanoid'
import { db } from '@/core/db'
import { logger } from '@/core/logger'

async function run(): Promise<void> {
  const outputDir = path.join(__dirname, '..', 'outputs')
  const parse = csv.parse
  const data = await fs.readFile(path.join(outputDir, 'quotes_clean.csv'))
  parse(data.toString(), { columns: true }, async (csvErr, rows: Quote[]) => {
    if (csvErr) throw csvErr
    logger.log('Start dumping...')

    try {
      await db
        .collection<Quote>('quotes')
        .insertMany(rows.map((row) => ({ ...row, uid: nanoid() })))
      logger.log('Done dumping.')
    } catch (error) {
      logger.error(error)
    }
  })
}

run()
