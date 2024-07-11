import { validatePermissions } from '../middleware/validatePermissions.js'
import publicProcedure from './public.js'

export default publicProcedure.use(validatePermissions)
