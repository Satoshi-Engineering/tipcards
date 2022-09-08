export type Card = {
  cardHash: string, // created via sha256(`${cardSetUuid}/${cardSetIndex}`)
  headline: string,
  text: string,
  invoice:  {
    amount: number,
    payment_hash: string,
    payment_request: string,
    paid: boolean,
  },
  lnbitsWithdrawId: string | null, // gets set as soon as the card is funded
  used: boolean,
}
