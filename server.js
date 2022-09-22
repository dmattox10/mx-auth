const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const bodyParser = require('body-parser')

// const CronJob = require('cron').CronJob

const authRouter = require('./routes/authRouter')
const { APP_PORT, APP_NAME, WHITELIST_URLS } = require('./env')
require('dotenv').config()

// const job = new CronJob('0 0 2 * * *', () => {
//   console.log('Running 2AM local db update.')
//   console.time('localdb.update()')
//   localdb.update()
//   console.timeEnd('localdb.update()')
// }, null, true, 'America/New_York')

const app = express()

const jsonParser = bodyParser.json()
const urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(cors({
  origin: WHITELIST_URLS
}))
app.use(helmet())
app.use(morgan('dev'))
app.use(jsonParser)

app.use('/v1/auth', urlencodedParser, authRouter)

app.get('/', (req, res) => {
  res.send('<h2>“The code is more what you’d call ‘guidelines’ than actual rules.” – Hector Barbossa</h2>')
})

const PORT = APP_PORT || 5050
app.listen(PORT, () => console.log(`'Ello ${APP_NAME}.`))
