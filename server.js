const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const bodyParser = require('body-parser')

const CronJob = require('cron').CronJob
const localdb = require('./tools/localdb')

const connectDB = require('./config/db')

const authRouter = require('./routes/authRouter')
const statsRouter = require('./routes/statsRouter')
const { APP_PORT, APP_NAME } = require('./env')
require('dotenv').config()

// const passportConfig = require('./config/passport')
const job = new CronJob('0 0 2 * * *', () => {
  console.log('Running 2AM local db update.')
  console.time('localdb.update()')
  localdb.update()
  console.timeEnd('localdb.update()')
}, null, true, 'America/New_York')

const app = express()
connectDB()

const jsonParser = bodyParser.json()
const urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(cors())
app.use(helmet())
app.use(morgan('dev'))
app.use(jsonParser)
// app.use(session({
//     resave: true,
//     saveUninitialized: true,
//     secret: process.env.SECRET || 'ShhhSecret',
//     cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
//     store: new MongoStore({
//         url: process.env.MONGODB_URI,
//         autoReconnect: true,
//     })

// }))
// app.use(passport.initialize())

// app.use(passport.session())
// app.use(flash())

app.use('/v1/auth', urlencodedParser, authRouter)
// app.use('/v1/user/dashboard', passportConfig.isAuthenticated, dashRouter)
app.use('/stats', statsRouter)

app.get('/', (req, res) => {
  res.send('<h2>“The code is more what you’d call ‘guidelines’ than actual rules.” – Hector Barbossa</h2>')
})

job.start()
const PORT = APP_PORT || 5050
app.listen(PORT, () => console.log(`'Ello ${APP_NAME}.`))
