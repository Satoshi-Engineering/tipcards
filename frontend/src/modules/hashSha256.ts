const hashSha256 = async (message: string) => {
  if (crypto.subtle == null && import.meta.env.MODE === 'development') {
    return message.replace(/\//g, '-').replace(/-/g,'')
  }
  const msgUint8 = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

export default hashSha256
