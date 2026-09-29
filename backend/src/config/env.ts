import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

let initialized = false

export function loadEnvironment() {
  if (initialized) return
  initialized = true

  const currentDir = path.dirname(fileURLToPath(import.meta.url))

  // Potential locations for .env regardless of where the node process was launched
  const candidatePaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'backend', '.env'),
    path.resolve(currentDir, '..', '..', '.env'),
    path.resolve(currentDir, '..', '..', '..', '.env'),
    path.resolve(currentDir, '..', '..', '..', 'backend', '.env'),
  ]

  for (const envPath of candidatePaths) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath })
    }
  }
}

// Auto-run on import
loadEnvironment()
