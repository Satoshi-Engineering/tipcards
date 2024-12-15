import { OpenTaskDto } from '@shared/data/trpc/OpenTaskDto.js'

import Collection from './Collection.js'
import type IOpenTask from './IOpenTask.js'
import OpenTaskBuilder from './OpenTaskBuilder.js'

export default class OpenTaskCollection extends Collection<IOpenTask> {
  public static async fromUserId(userId: string): Promise<OpenTaskCollection> {
    const builder = new OpenTaskBuilder(userId)
    await builder.build()
    return new OpenTaskCollection(builder.openTasks)
  }

  public constructor(openTasks: IOpenTask[]) {
    super(openTasks)
  }

  public toTrpcResponse(): OpenTaskDto[] {
    return this.data.map((openTask) => openTask.toTrpcResponse())
  }
}
