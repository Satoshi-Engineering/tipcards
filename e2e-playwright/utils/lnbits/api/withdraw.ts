import { APIRequestContext } from '@playwright/test'
import * as z from 'zod'

const CreateWithdrawData = z.object({
  title: z.string(),

  min_withdrawable: z.number().int().min(1),
  max_withdrawable: z.number().int().min(1),
  uses: z.number().int().min(1),
  wait_time: z.number().int().min(1),

  is_unique: z.boolean(),

  webhook_url: z.string().nullish(),
  webhook_headers: z.string().nullish(),
  webhook_body: z.string().nullish(),
  custom_url: z.string().nullish(),
})

type CreateWithdrawData = z.infer<typeof CreateWithdrawData>

export const updateWithdrawLink = async (context: APIRequestContext, withdrawLinkId: string, withdrawData: Partial<CreateWithdrawData>) => {
  const currentWithdrawData = await getWithdrawLink(context, withdrawLinkId)
  await putWithdrawLink(context, withdrawLinkId, {
    ...currentWithdrawData,
    ...withdrawData,
  })
}

const getWithdrawLink = async (context: APIRequestContext, withdrawLinkId: string) => {
  const response = await context.get(`/withdraw/api/v1/links/${withdrawLinkId}`)
  return CreateWithdrawData.parse(await response.json())
}

const putWithdrawLink = async (context: APIRequestContext, withdrawLinkId: string, withdrawData: CreateWithdrawData) => {
  const response = await context.put(`/withdraw/api/v1/links/${withdrawLinkId}`, {
    data: withdrawData,
  })
  return await response.json()
}
