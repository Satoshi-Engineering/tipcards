import { authenticateUser } from '../middleware/authenticateUser.js'
import publicProcedure from './public.js'

export default publicProcedure.use(authenticateUser)
