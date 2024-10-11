import publicProcedure from './public.js'
import { validateRefreshToken } from '../middleware/validateRefreshToken.js'

export default publicProcedure.use(validateRefreshToken)
