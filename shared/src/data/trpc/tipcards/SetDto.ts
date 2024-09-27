import z from 'zod'

import { SetSettingsDto } from './SetSettingsDto.js'

/**
 * model for the sets list
 */
export const SetDto = z.object({
  id: z.string(),
  created: z.date().default(() => new Date()),
  changed: z.date().default(() => new Date()),
  settings: SetSettingsDto.default(SetSettingsDto.parse({})),
})
export type SetDto = z.infer<typeof SetDto>
