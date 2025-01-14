import { z } from 'zod'

import { router } from '@auth/trpc/trpc.js'
import publicProcedure from '@auth/trpc/procedures/public.js'
import Auth from '@auth/domain/Auth.js'
import assert from 'node:assert'
import { tracked, type TrackedEnvelope } from '@trpc/server'
import { LnurlAuthLoginStatusEnum } from '@shared/auth/data/trpc/LnurlAuthLoginStatusEnum.js'
import { LnurlAuthLoginDto } from '@shared/auth/data/trpc/LnurlAuthLoginDto.js'
import { LnurlAuthLoginStatusDto } from '@shared/auth/data/trpc/LnurlAuthLoginStatusDto.js'

export const lnurlAuthRouter = router({
  create: publicProcedure
    .output(LnurlAuthLoginDto)
    .query(async () => {
      const { id, hash, lnurlAuth } = await Auth.instance.lnurlAuthLogin.create()
      return {
        id,
        lnurlAuth,
        hash,
        status: LnurlAuthLoginStatusEnum.enum.lnurlCreated,
      }
    }),

  login: publicProcedure
    .input(
      z
        .object({
          lastEventId: z.string(),
        }),
    )
    // todo: add output type definition/validation:
    // https://gitlab.satoshiengineering.com/satoshiengineering/projects/-/issues/1300#note_19422
    //.output(LnurlAuthLoginDto)
    .subscription(async function* ({ input }): AsyncGenerator<TrackedEnvelope<LnurlAuthLoginStatusDto>> {
      const { id, hash, lnurlAuth } = await Auth.instance.lnurlAuthLogin.get(input.lastEventId)

      if (lnurlAuth == null) {
        yield loginResponse({
          id,
          status: LnurlAuthLoginStatusEnum.enum.failed,
        })
        return
      }

      if (lnurlAuth != null && Auth.instance.lnurlAuthLogin.isOneTimeLoginHashValid(hash)) {
        yield loginResponse({
          id,
          status: LnurlAuthLoginStatusEnum.enum.loggedIn,
        })
        return
      }

      try {
        await Auth.instance.lnurlAuthLogin.waitForLogin(hash)
        assert(lnurlAuth != null)
        yield loginResponse({
          id,
          status: LnurlAuthLoginStatusEnum.enum.loggedIn,
        })
      } catch {
        yield loginResponse({
          id,
          status: LnurlAuthLoginStatusEnum.enum.failed,
        })
      }
    }),
})

// workaround until procedure.output(LnurlAuthLoginDto) is implemented
const loginResponse = (data: LnurlAuthLoginStatusDto) => tracked(data.id, LnurlAuthLoginStatusDto.parse(data))
