export type Card = {
  cardHash: string, // created via sha256(`${cardSetUuid}/${cardSetIndex}`)
  text: string,
  note?: string,
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
    id: number,
    created: number, // unix timestamp
    paid: number | null, // unix timestamp
    expired?: boolean,
  } | null, // gets created if the user scans an unfunded card with a wallet
  setFunding?: {
    amount: number,
    created: number, // unix timestamp
    paid: number | null, // unix timestamp
  }, // card is funded via set-funding
  lnbitsWithdrawId: string | null, // gets set as soon as the card is funded
  landingPageViewed?: number, // store the first time the landing page was viewed after it has been funded
  withdrawPending?: boolean, // if this is true the user clicked on "receive sats" in the wallet app but the invoice isn't paid yet (this flag should not be persisted to the database)
  used: number | null, // unix timestamp
}
