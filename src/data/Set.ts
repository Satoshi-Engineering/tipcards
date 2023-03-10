export type Set = {
  id: string,
  text: string,
  note?: string,
  invoice:  {
    fundedCards: number[], // list of card indices (e.g. [0, 1, 2, 5, 7])
    amount: number, // total amount
    payment_hash: string,
    payment_request: string,
    created: number, // unix timestamp
    paid: number | null, // unix timestamp
    expired?: boolean,
  } | null,
}
