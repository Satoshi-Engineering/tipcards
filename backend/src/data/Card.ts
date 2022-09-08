export type Card = {
  // use sha256(`${cardSetUuid}/${cardSetIndex}`) to create the cardHash
  cardSetUuid: string, // a card always is part of a set
  cardSetIndex: number, // the place in the set
  lnbitsWithdrawId: string, // gets set as soon as the card gets funded
  used: boolean,
}
