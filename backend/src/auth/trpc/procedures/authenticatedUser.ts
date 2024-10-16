import publicProcedure from './public.js'
import { authenticateUser } from '@backend/auth/trpc/middleware/authenticateUser.js'

export default publicProcedure.use(authenticateUser)
