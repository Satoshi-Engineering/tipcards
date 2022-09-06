/* eslint-disable no-console */
import { send } from './services/telegram'

function appendTime(args: Array<unknown>) {
  const timezoneOffset = (new Date()).getTimezoneOffset() * 60000
  const time = (new Date(Date.now() - timezoneOffset)).toISOString().replace(/T/, ' ').replace(/\..+/, '')

  if (typeof args[0] === 'string') {
    return [`[${time}] ${args[0]}`, ...args.slice(1)]
  }

  return [`[${time}]`, ...args]
}

export default () => {
  // Save the original console functions
  const origDebug = console.debug
  const origLog = console.log
  const origInfo = console.info
  const origWarn = console.warn
  const origError = console.error

  console.debug = (...args) => {
    const argsWithTime = appendTime(args)
    origDebug(...argsWithTime)
  }

  console.log = (...args) => {
    const argsWithTime = appendTime(args)
    origLog(...argsWithTime)
  }

  console.info = (...args) => {
    const argsWithTime = appendTime(args)
    origInfo(...argsWithTime)
  }

  console.warn = (...args) => {
    const argsWithTime = appendTime(args)
    origWarn(...argsWithTime)
  }

  console.error = (...args) => {
    const argsWithTime = appendTime(args)

    origError(...argsWithTime)

    // Send Error Message to telegram
    const message = args
      .map((value) => {
        if (typeof value === 'string') {
          return value
        }
        if (value instanceof Error) {
          return value.stack
        }
        return JSON.stringify(value)
      })
      .join('\n')
    send({ message })
  }
}
