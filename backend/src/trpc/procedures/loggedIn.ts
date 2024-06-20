import { validatePermissions } from '../middleware/validatePermissions'
import publicProcedure from './public'

export default publicProcedure.use(validatePermissions)
