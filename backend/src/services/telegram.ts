import axios from 'axios'

const TELEGRAM_BOT_ID = process.env.TELEGRAM_BOT_ID || false
const TELEGRAM_GROUP_ID_ERROR = process.env.TELEGRAM_GROUP_ID_ERROR
const TELEGRAM_GROUP_ID_TODO = process.env.TELEGRAM_GROUP_ID_TODO
const TELEGRAM_PREFIX = process.env.TELEGRAM_PREFIX || false
const TELEGRAM_CHARMAX = Number(process.env.TELEGRAM_CHAR_MAX) || 500

/**
 * Returns status code 0 if successful
 * 
 * @returns
 */
export const send = async ({ header, message, group }: { header?: string, message: string, group?: string }): Promise<number> => {
  if (!TELEGRAM_BOT_ID) {
    return 1
  }

  let messageFormatted = ''
  if (typeof header === 'string') {
    messageFormatted += `${header}\n`
  }
  if (TELEGRAM_PREFIX) {
    messageFormatted += `[${TELEGRAM_PREFIX}]\n`
  }
  messageFormatted += message
  if (messageFormatted.length > TELEGRAM_CHARMAX) {
    messageFormatted = messageFormatted.substring(0, TELEGRAM_CHARMAX) + ' (Message Truncated)'
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_ID}/sendMessage`

  let chatId = TELEGRAM_GROUP_ID_ERROR
  if (group === 'todo') {
    chatId = TELEGRAM_GROUP_ID_TODO
  }
  const data = JSON.stringify({
    'chat_id': chatId,
    'text': messageFormatted,
  })
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  }
  await axios.post(url, data, config)
  return 0
}
