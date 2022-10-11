export type Card = {
  cardHash: string, // created via sha256(`${cardSetUuid}/${cardSetIndex}`)
  text: string,
  invoice:  {
    amount: number,
    payment_hash: string,
    payment_request: string,
    created: number, // unix timestamp
    paid: number | null, // unix timestamp
  } | null,
  lnurlp: {
    amount: number | null,
    payment_hash: string | null,
    id: number,
    created: number, // unix timestamp
    paid: number | null, // unix timestamp
  } | null, // gets created if the user scans an unfunded card with a wallet
  lnbitsWithdrawId: string | null, // gets set as soon as the card is funded
  used: number | null, // unix timestamp
}
