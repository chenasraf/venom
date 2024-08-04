import fs from 'node:fs/promises'

export async function fileExists(file: string) {
  try {
    await fs.access(file, fs.constants.F_OK)
    return true
  } catch {
    return false
  }
}

export async function getFileSize(file: string) {
  const stats = await fs.stat(file)
  return stats.size
}
