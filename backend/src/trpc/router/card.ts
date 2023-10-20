import Card from '../../modules/Card'

import { Card as CardTrpc } from '../data/Card'
import { router, publicProcedure } from '../trpc'

export const cardRouter = router({
  getByHash: publicProcedure
    .input(CardTrpc.shape.hash)
    .output(CardTrpc)
    .query(async ({ input }) => {
      const card = await Card.fromCardHash(input)
      return await card.toTRpcResponse()
    }),
})
