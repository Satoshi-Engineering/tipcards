import { Card } from '../data/Card'
import { Set } from '../data/Set'
import {
  router,
  publicProcedure,
} from '../trpc'
import { loggedInProcedure } from '../loggedInProcedure'

export const setRouter = router({
  getAll: loggedInProcedure
    .output(Set.array())
    .query(async () => {
      return []
    }),
  getCards: publicProcedure
    .input(Set.shape.id)
    .query(async () => {
      const cards = Card.array().parse([{}])
      return cards
    }),
})
