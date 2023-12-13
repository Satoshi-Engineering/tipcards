import { Router } from 'express'

const router = Router()

/////
// DUMMY
//
router.get('/', async (_, res) => {
  res.json({
    status: 'success',
    data: 'dummy',
  })
})

export default router
