export type Card = {
  cardHash: string, // created via sha256(`${cardSetUuid}/${cardSetIndex}`)
  text: string,
  invoice:  {
    amount: number,
    payment_hash: string,
    payment_request: string,
    created: number, // unix timestamp
    paid: number | null, // unix timestamp
  },
  lnbitsWithdrawId: string | null, // gets set as soon as the card is funded
  used: number | null, // unix timestamp
}
