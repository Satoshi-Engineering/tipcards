import '@backend/initEnv' // Info: .env needs to read before imports
import '@backend/initErrorLogging'

import { startup } from '@backend/startup'

startup()
