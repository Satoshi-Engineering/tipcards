import z from 'zod'

export const RefreshTokenPayload = z.object({
  userId: z.string(),
  sessionId: z.string().uuid(),
  nonce: z.string().uuid().describe('this makes sure every token is unique'),
})

export type RefreshTokenPayload = z.infer<typeof RefreshTokenPayload>
