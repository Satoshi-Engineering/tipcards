import crypto from 'crypto'

const hashSha256 = async (message: string) => {
  const messageBuffer = Buffer.from(message)
  const hash = crypto.createHash('sha256').update(messageBuffer).digest('hex')
  return hash
}

export default hashSha256
