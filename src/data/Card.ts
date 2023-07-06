export type Card = {
  cardHash: string, // created via sha256(`${cardSetUuid}/${cardSetIndex}`)
  text?: string, // shown in lightning app when withdrawing
  note?: string, // shown on status page of card (info for person who funded the card)
  invoice:  {
    amount: number,
    payment_hash: string,
    payment_request: string,
    created: number, // unix timestamp
    paid: number | null, // unix timestamp
    expired?: boolean,
  } | null,
  lnurlp: {
    shared?: boolean,
    amount: number | null,
    payment_hash: string[] | null,
    id: number | string,
    created: number, // unix timestamp
    paid: number | null, // unix timestamp
    expired?: boolean,
  } | null, // gets created if the user scans an unfunded card with a wallet
  setFunding?: {
    amount: number,
    created: number, // unix timestamp
    paid: number | null, // unix timestamp
    expired?: boolean,
  }, // card is funded via set-funding
  lnbitsWithdrawId: string | null, // gets set as soon as the card is funded
  landingPageViewed?: number, // store the first time the landing page was viewed after it has been funded
  withdrawPending?: boolean, // if this is true the user clicked on "receive sats" in the wallet app but the invoice isn't paid yet (this flag should not be persisted to the database)
  used: number | null, // unix timestamp
}

export type CardStatusStatus =
  'unfunded'
  | 'invoiceFunding' | 'lnurlpFunding' | 'lnurlpSharedFunding' | 'setInvoiceFunding'
  | 'invoiceExpired' | 'lnurlpExpired' | 'lnurlpSharedExpiredEmpty' | 'lnurlpSharedExpiredFunded' | 'setInvoiceExpired'
  | 'funded'
  | 'withdrawPending' | 'recentlyWithdrawn' | 'withdrawn'

export type CardStatus = {
  lnurl: string
  status: CardStatusStatus
  amount?: number
  createdDate?: number
  fundedDate?: number
  withdrawnDate?: number
}
