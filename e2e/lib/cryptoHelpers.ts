export const sha256 = async (message: string) => {
  const messageUint8 = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('sha-256', messageUint8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}
