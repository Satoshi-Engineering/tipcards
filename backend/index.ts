/* eslint-disable no-console */
import 'dotenv/config'

import consoleOverride from '@backend/consoleOverride'

import { startup } from './startup'

consoleOverride()
startup()
