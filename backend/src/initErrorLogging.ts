import TelegramSender from 'telegram-sender'
import consoleHooks from 'console-hooks'

import {
  TELEGRAM_BOT_ID,
  TELEGRAM_GROUP_ID_ERROR,
  TELEGRAM_PREFIX,
  TELEGRAM_CHAR_MAX,
} from '@backend/constants.js'

const initErrorLogging = () => {
  const telegramSender = initTelegramSender()

  consoleHooks({
    onError: async (message: string) => {
      // Ignore abort errors
      // I was not able to figure out how to exactly reproduce it, and therefore also not how to catch it
      // But it happens kinda often and spams the logs
      // https://gitlab.satoshiengineering.com/satoshiengineering/projects/-/issues/1809
      if (message.includes('AbortError: The operation was aborted')) {
        return
      }

      await telegramSender?.sendMessage({ message })
    },
  })
}

const initTelegramSender = () => {
  if (
    typeof TELEGRAM_BOT_ID !== 'string'
    || typeof TELEGRAM_GROUP_ID_ERROR !== 'string'
  ) {
    console.warn('TELEGRAM_BOT_ID and TELEGRAM_GROUP_ID_ERROR are not set in .env\nWill not send error messages to Telegram.')
    return null
  }

  return new TelegramSender({
    token: TELEGRAM_BOT_ID,
    defaultChatId: TELEGRAM_GROUP_ID_ERROR,
    messagePrefix: TELEGRAM_PREFIX,
    messageMaxLength: TELEGRAM_CHAR_MAX,
  })
}

initErrorLogging()
