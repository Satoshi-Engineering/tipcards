import publicProcedure from './public.js'
import { validateRefreshToken } from '@auth/trpc/middleware/validateRefreshToken.js'

export default publicProcedure.use(validateRefreshToken)
