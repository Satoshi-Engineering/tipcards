import TelegramSender from 'telegram-sender'
import consoleHooks from 'console-hooks'

const initErrorLogging = () => {
  const telegramSender = initTelegramSender()

  consoleHooks({
    onError: async (message: string) => {
      await telegramSender?.sendMessage({ message })
    },
  })
}

const initTelegramSender = () => {
  if (
    typeof process.env.TELEGRAM_BOT_ID !== 'string'
    || typeof process.env.TELEGRAM_GROUP_ID_ERROR !== 'string'
  ) {
    console.warn('TELEGRAM_BOT_ID and TELEGRAM_GROUP_ID_ERROR are not set in .env\nWill not send error messages to Telegram.')
    return null
  }

  return new TelegramSender({
    token: process.env.TELEGRAM_BOT_ID,
    defaultChatId: process.env.TELEGRAM_GROUP_ID_ERROR,
    messagePrefix: process.env.TELEGRAM_PREFIX,
    messageMaxLength: Number(process.env.TELEGRAM_CHAR_MAX),
  })
}

initErrorLogging()
