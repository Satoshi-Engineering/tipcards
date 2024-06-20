import '@backend/initEnv' // Info: .env needs to read before imports

import { initErrorLogging } from '@backend/initErrorLogging'
import { startup } from '@backend/startup'

initErrorLogging()

startup()
