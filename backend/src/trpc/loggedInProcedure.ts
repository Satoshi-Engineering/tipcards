import { validateJwt } from './middleware/validateJwt'
import { publicProcedure } from './trpc'

export const loggedInProcedure = publicProcedure.use(validateJwt)
