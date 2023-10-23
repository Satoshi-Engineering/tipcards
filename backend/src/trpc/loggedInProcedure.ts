import { validatePermissions } from './middleware/validatePermissions'
import { publicProcedure } from './trpc'

export const loggedInProcedure = publicProcedure.use(validatePermissions)
