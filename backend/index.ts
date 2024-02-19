/* eslint-disable no-console */
import '@backend/initEnv' // Info: .env needs to read before imports

import consoleOverride from '@backend/consoleOverride'
import { startup } from '@backend/startup'

consoleOverride()
startup()
