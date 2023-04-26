export type Settings = {
  numberOfCards: number
  cardHeadline: string
  cardCopytext: string
  cardsQrCodeLogo: string
  setName?: string
}

export type Set = {
  id: string
  settings?: Settings | null
  created?: number // unix timestamp
  date?: string | number // iso string or unix timestamp of latest update

  userId?: string | null

  text?: string // this text is used if cards are funded via set-funding
  note?: string // this note is used if cards are funded via set-funding
  invoice?: {
    fundedCards: number[] // list of card indices (e.g. [0, 1, 2, 5, 7])
    amount: number // total amount
    payment_hash: string
    payment_request: string
    created: number // unix timestamp
    paid: number | null // unix timestamp
    expired?: boolean
  } | null
}
