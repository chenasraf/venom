import { db } from '@/core/db'

const collection = db.collection('settings')

export async function getSetting<T = unknown>(name: string): Promise<T> {
  const setting = await collection.findOne({ name })
  return setting?.value as T
}

export async function setSetting<T>(name: string, value: T): Promise<boolean> {
  const result = await collection.updateOne({ name }, { $set: { value } }, { upsert: true })
  return result.upsertedCount > 0
}
