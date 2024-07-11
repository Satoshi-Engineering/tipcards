import { TRPCError } from '@trpc/server'

import { validateJwt } from './validateJwt.js'

/**
 * @throws TRPCError
 */
export const validatePermissions = validateJwt.unstable_pipe(async ({ ctx, meta, next }) => {
  meta?.requiredPermissions.forEach((permission) => {
    if (!ctx.accessToken.permissions.includes(permission)) {
      throw new TRPCError({ message: `Missing permissions: ${permission}`, code: 'FORBIDDEN' })
    }
  })
  return next()
})
