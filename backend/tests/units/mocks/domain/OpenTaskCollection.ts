import { vi } from 'vitest'

import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'
import { OpenTaskType, type OpenTaskDto } from '@shared/data/trpc/OpenTaskDto.js'

vi.mock('@backend/domain/OpenTaskCollection.js', () => ({
  default: MockOpenTaskCollection,
}))

export const openTask: OpenTaskDto = {
  type: OpenTaskType.enum.cardAction,
  created: new Date(),
  amount: 210,
  feeAmount: 3,
  cardStatus: CardStatusEnum.enum.invoiceFunding,
  cardHash: 'cardHash',
  noteForStatusPage: 'noteForStatusPage',
  textForWithdraw: 'textForWithdraw',
}

class MockOpenTaskCollection {
  public static async fromUserId(): Promise<MockOpenTaskCollection> {
    return new MockOpenTaskCollection()
  }

  public toTrpcResponse(): OpenTaskDto[] {
    return [openTask]
  }
}
