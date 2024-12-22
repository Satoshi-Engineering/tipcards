import CardStatusCollection from './CardStatusCollection.js'
import type IOpenTask from './IOpenTask.js'
import SetCollection from './SetCollection.js'
import OpenBulkWithdrawTaskBuilder from './OpenBulkWithdrawTaskBuilder.js'
import OpenCardTaskBuilder from './OpenCardTaskBuilder.js'
import OpenSetFundingTaskBuilder from './OpenSetFundingTaskBuilder.js'

export default class OpenTaskBuilder {
  public readonly userId: string

  public constructor(userId: string) {
    this.userId = userId
  }

  public async build(): Promise<void> {
    const setCollection = await SetCollection.fromUserId(this.userId)
    this.cardStatusCollection = await CardStatusCollection.fromCardHashes(setCollection.cardHashes)
    this.openCardTaskBuilder = new OpenCardTaskBuilder(this.cardStatusCollection)
    this.openBulkwithdrawTaskBuilder = new OpenBulkWithdrawTaskBuilder(this.cardStatusCollection)
    this.openSetFundingTaskBuilder = new OpenSetFundingTaskBuilder(this.cardStatusCollection)
    await Promise.all([
      this.openCardTaskBuilder.build(),
      this.openBulkwithdrawTaskBuilder.build(),
      this.openSetFundingTaskBuilder.build(),
    ])
  }

  public get openTasks(): IOpenTask[] {
    return [
      ...this.openCardTaskBuilder.openTasks,
      ...this.openBulkwithdrawTaskBuilder.openTasks,
      ...this.openSetFundingTaskBuilder.openTasks,
    ]
  }

  private cardStatusCollection: CardStatusCollection = new CardStatusCollection([])
  private openCardTaskBuilder: OpenCardTaskBuilder = new OpenCardTaskBuilder(this.cardStatusCollection)
  private openBulkwithdrawTaskBuilder: OpenBulkWithdrawTaskBuilder = new OpenBulkWithdrawTaskBuilder(this.cardStatusCollection)
  private openSetFundingTaskBuilder: OpenSetFundingTaskBuilder = new OpenSetFundingTaskBuilder(this.cardStatusCollection)
}
