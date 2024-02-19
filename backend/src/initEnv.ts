import { config } from 'dotenv'
import path from 'path'

// DO NOT IMPORT USING @backend AS THIS FILE IS ALSO USED BY DRIZZLE-KIT

const argument = process.argv.slice(2).find((value) => value.indexOf('--env') === 0)
let envFile = '.env'
if (argument) {
  const value = argument.split('=')[1]
  envFile = `.env.${value}`
}

config({ path: path.resolve(process.cwd(), envFile) })
config({ path: path.resolve(process.cwd(), 'backend', envFile) })
