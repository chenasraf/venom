import 'reflect-metadata'
import csv from 'csv'
import dotenv from 'dotenv'
import fs from 'node:fs/promises'
import path from 'node:path'
// import { getHTMLPage } from '../http-tools';
import { JSDOM } from 'jsdom'
import { Quote } from '@/commands/quotes.command'
import { logger } from '@/core/logger'
import { friendlyUID } from '@/utils/string_utils'

const PAGE_SIZE = 15
const MAX_PAGE = 35
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') })
const quotes: Quote[] = []

async function run(): Promise<void> {
  const url = 'https://www.creationasylum.net/index.php?act=quotes&CODE=01'
  const outputDir = path.join(__dirname, '..', 'outputs')
  // fs.exists(outputDir, (exists) => {
  //   if (!exists) {
  //     fs.mkdir(outputDir, (err) => {
  //       if (err) throw err
  //     })
  //   }
  // })

  const promises: Array<Promise<Quote[]>> = []

  for (let i = 0; i < PAGE_SIZE * MAX_PAGE; i += PAGE_SIZE) {
    const urlWithPage = `${url}&st=${i}`
    logger.log(`fetching: ${urlWithPage}`)

    const headers = new Headers()
    headers.set('Cookie', process.env.CA_SCRAPER_COOKIE!)
    promises.push(
      fetch(urlWithPage, {
        method: 'GET',
        headers: headers,
      })
        .then(async (res) => {
          const dom = new JSDOM(await res.text())
          const {
            window: { document },
          } = dom
          for (const row of document.querySelectorAll('#ucpcontent table.ipbtable tr')) {
            const authorName = (row.querySelector('td:first-child') as HTMLElement).innerText
            const quote = (row.querySelector('td:nth-child(2)') as HTMLElement).innerText
            if (!authorName && !quote) continue
            quotes.push({ authorName, quote, uid: friendlyUID() })
          }
          return quotes
        })
        .catch((error) => {
          logger.error(error)
          return [] as Quote[]
        }),
    )
  }

  await Promise.all(promises)

  await fs.writeFile(path.join(outputDir, 'quotes.json'), JSON.stringify(quotes))
  logger.log('Wrote output.')

  const csvOut = [['author', 'quote']]
  for (const row of quotes) {
    csvOut.push(
      [row.authorName, row.quote] /*.map((v) => {
        v = v.replace(/(\n+)/g, '\n').replace(/"/g, '""').trim()
        return v.includes(' ') || v.includes('\t') ? `"${v}"` : v
      })*/,
    )
  }

  const stringify = csv.stringify
  await new Promise((res, rej) => {
    stringify(quotes, async (err, out) => {
      if (err) {
        rej(err)
        return
      }
      await fs.writeFile(path.join(outputDir, 'quotes.csv'), out)
      logger.log('Wrote output.')
      res(undefined)
    })
  })
}

run()
