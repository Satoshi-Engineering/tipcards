import { router } from '@auth/trpc/trpc.js'
import publicProcedure from '@auth/trpc/procedures/public.js'
import Auth from '@auth/domain/Auth.js'
import {
  LnurlAuthLoginStatusEnum,
  LnurlAuthLoginDto,
} from '@auth/data/trpc/LnurlAuthLoginDto.js'

export const lnurlAuthRouter = router({
  /**
   * This procedure is for cypress tests only as cypress is not able to handle trpc subscriptions out-of-the-box.
   *
   * @testing
   */
  create: publicProcedure
    .output(LnurlAuthLoginDto)
    .query(async () => {
      const { lnurlAuth, hash } = await Auth.instance.lnurlAuthLogin.create()
      return {
        lnurlAuth,
        hash,
        status: LnurlAuthLoginStatusEnum.enum.lnurlCreated,
      }
    }),

  login: publicProcedure
    // todo: add output type definition
    //.output(LnurlAuthLoginDto)
    .subscription(async function* () {
      const { lnurlAuth, hash } = await Auth.instance.lnurlAuthLogin.create()
      yield {
        lnurlAuth,
        status: LnurlAuthLoginStatusEnum.enum.lnurlCreated,
      }

      try {
        await Auth.instance.lnurlAuthLogin.waitForLogin(hash)
        yield {
          lnurlAuth,
          hash,
          status: LnurlAuthLoginStatusEnum.enum.loggedIn,
        }
      } catch {
        yield {
          lnurlAuth,
          status: LnurlAuthLoginStatusEnum.enum.failed,
        }
      }
    }),
})
