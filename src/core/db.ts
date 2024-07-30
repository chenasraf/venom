import { MONGODB_URI } from '@/env'
import { MongoClient } from 'mongodb'

const client = new MongoClient(MONGODB_URI)
export const db = client.db()
