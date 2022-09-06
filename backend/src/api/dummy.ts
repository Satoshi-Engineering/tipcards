import express from 'express'

const router = express.Router()

////////////////
//////// DUMMY
////
router.get('/', async (req: express.Request, res: express.Response) => {
  res.json({
    status: 'success',
    data: 'dummy',
  })
})

export default router
