import { Set } from '../schema/Set.js'
import { SetSettings } from '../schema/SetSettings.js'

export type SetWithSettings = Set & { settings: SetSettings }
