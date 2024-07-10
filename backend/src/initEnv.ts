import { config } from 'dotenv'
import path from 'path'

// DO NOT IMPORT USING @backend AS THIS FILE IS ALSO USED BY DRIZZLE-KIT

const argumentEnvIntegrationTest = process.argv.slice(2).find((value) => value.indexOf('--envIntegrationTest') === 0)
let envFile = '.env'
if (
  argumentEnvIntegrationTest
  || process.env.VITEST
) {
  envFile = '.env.integrationTest'
}

config({
  path: path.resolve(process.cwd(), envFile),
  override: true, // we want to make sure that our configured values are always used
})
config({
  path: path.resolve(process.cwd(), 'backend', envFile),
  override: true, // we want to make sure that our configured values are always used
})
