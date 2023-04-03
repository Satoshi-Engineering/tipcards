import bodyParser from 'body-parser'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import auth from './api/auth'
import card from './api/card'
import dummy from './api/dummy'
import invoice from './api/invoice'
import lnurl from './api/lnurl'
import lnurlp from './api/lnurlp'
import set from './api/set'
import withdraw from './api/withdraw'
import statistics from './api/statistics'
import xstAttack from './xstAttack'

const app = express()
app.use(bodyParser.json())
app.use(cors())
app.use(helmet())
app.use(xstAttack())
app.use('/api/auth', auth)
app.use('/api/card', card)
app.use('/api/dummy', dummy)
app.use('/api/invoice', invoice)
app.use('/api/lnurl', lnurl)
app.use('/api/lnurlp', lnurlp)
app.use('/api/set', set)
app.use('/api/withdraw', withdraw)
app.use('/api/statistics', statistics)

export default app
