import { Card } from '@backend/database/schema/Card.js'
import EventEmitter from 'node:events'

export default class ApplicationEventEmitter extends EventEmitter {
  public static init(): void {
    if (ApplicationEventEmitter.singleton != null) {
      throw new Error('ApplicationEventEmitter already initialized!')
    }

    ApplicationEventEmitter.singleton = new ApplicationEventEmitter()
  }

  public static get instance(): ApplicationEventEmitter {
    if (ApplicationEventEmitter.singleton == null) {
      throw new Error('ApplicationEventEmitter instance accessed before init!')
    }

    return ApplicationEventEmitter.singleton
  }

  private static singleton: ApplicationEventEmitter
}

export const cardUpdateEvent = (cardHash: Card['hash']) => `card:update:${cardHash}`
