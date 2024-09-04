import { router } from '../../trpc.js'
import { lnurlAuthRouter } from './lnurlAuth.js'

export const authRouter = router({
  lnurlAuth: lnurlAuthRouter,
})
