import { config } from 'dotenv'
import path from 'path'
import fs from 'fs'

const envTest = path.resolve(process.cwd(), '.env.test')
if (fs.existsSync(envTest)) {
  config({ path: envTest })
} else {
  config()
}
