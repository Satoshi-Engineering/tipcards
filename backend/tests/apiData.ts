import hashSha256 from '@backend/services/hashSha256'
import { randomUUID } from 'crypto'

const generateCardHash = () => { return hashSha256(randomUUID()) }

export const cardData = {
  DEFAULT_AMOUNT_IN_SATS: 100,
  generateCardHash,
  generateCard: (amount: number) => {
    const cardHash = generateCardHash()
    return {
      cardHash,
      amount,
      text: `${cardHash} textForWithdraw`,
      note: `${cardHash} noteForStatusPage`,
    }
  },
}
