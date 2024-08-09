import { MONGODB_URI } from '@/env'
import { MongoClient } from 'mongodb'
import { logger } from '@/core/logger'

const client = new MongoClient(MONGODB_URI)
client.on('open', () => {
  logger.log('Connected to MongoDB')
})
export const db = client.db()
