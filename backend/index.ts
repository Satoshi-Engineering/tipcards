import '@backend/initEnv.js' // Info: .env needs to read before imports
import '@backend/initErrorLogging.js'

import { startup } from '@backend/startup.js'

startup()
