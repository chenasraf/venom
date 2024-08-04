import { customAlphabet } from 'nanoid'

export function friendlyUID() {
  return customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 8)()
}
