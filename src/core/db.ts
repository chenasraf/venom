import { MONGODB_URI } from '@/env'
import { MongoClient } from 'mongodb'

const client = new MongoClient(MONGODB_URI)
client.on('open', () => {
  console.log('Connected to MongoDB')
})
export const db = client.db()
