import { OpenTaskDto } from '@shared/data/trpc/OpenTaskDto.js'

export default interface IOpenTask {
  toTrpcResponse(): OpenTaskDto

  readonly created: Date
}
