import { customAlphabet } from 'nanoid'

export function friendlyUID() {
  return customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 8)()
}

export function formatBytes(bytes: number) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const formattedNumber = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(
    bytes / Math.pow(1024, i),
  )
  return `${formattedNumber} ${sizes[i]}`
}
