import { config } from 'dotenv'
import path from 'path'

// DO NOT IMPORT USING @backend AS THIS FILE IS ALSO USED BY DRIZZLE-KIT

declare global {
  // eslint-disable-next-line no-var
  var __ENV_FILE_POSTFIX__: string
}

const argument = process.argv.slice(2).find((value) => value.indexOf('--envFilePostfix') === 0)
let envFile = '.env'
if (argument) {
  const value = argument.split('=')[1]
  envFile = `.env.${value}`
} else if (global.__ENV_FILE_POSTFIX__) {
  envFile = `.env.${global.__ENV_FILE_POSTFIX__}`
}

config({ path: path.resolve(process.cwd(), envFile) })
config({ path: path.resolve(process.cwd(), 'backend', envFile) })
