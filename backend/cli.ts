import '@backend/initEnv.js' // Info: .env needs to read before imports

import Database from '@backend/database/Database.js'
import { prompt } from '@backend/services/cliHelpers.js'

/* eslint-disable no-console */
const run = async () => {
  console.log('Connecting to sql database ...')
  await Database.init()
  loop()
}

const loop = async () => {
  console.log('\nWhat do you want to do?')
  console.log('0. Leave.')
  console.log('1. Dummy action (all migration removed at the moment).')
  const answer = await prompt('Type a number: ')

  if (answer === '0') {
    console.log('Closing database connection ...')
    await Database.closeConnectionIfExists()
    process.exit()
  } if (answer === '1') {
    await dummyAction()
  }
  setTimeout(loop, 0)
}

const dummyAction = async () => {
  console.log('Dummy action ...')
  await new Promise(resolve => setTimeout(resolve, 1000))
  console.log('Dummy action done.')
}

run()
/* eslint-enable no-console */
