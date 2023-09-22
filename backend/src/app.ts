import bodyParser from 'body-parser'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

import assets from './api/assets'
import auth from './api/auth'
import card from './api/card'
import cardLogos from './api/cardLogos'
import dummy from './api/dummy'
import invoice from './api/invoice'
import landingPages from './api/landingPages'
import lnurl from './api/lnurl'
import lnurlp from './api/lnurlp'
import set from './api/set'
import withdraw from './api/withdraw'
import statistics from './api/statistics'
import xstAttack from './xstAttack'
import corsOptions from './services/corsOptions'
import './worker'



const app = express()
app.use(bodyParser.json())
app.use(cors(corsOptions))
app.use(helmet())
app.use(xstAttack())
app.use('/api/assets', assets)
app.use('/api/auth', auth)
app.use('/api/card', card)
app.use('/api/cardLogos', cardLogos)
app.use('/api/dummy', dummy)
app.use('/api/invoice', invoice)
app.use('/api/landingPages', landingPages)
app.use('/api/lnurl', lnurl)
app.use('/api/lnurlp', lnurlp)
app.use('/api/set', set)
app.use('/api/withdraw', withdraw)
app.use('/api/statistics', statistics)

export default app
