const express = require("express")
const connectDB = require("./config/db")
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const passport = require('passport')
const flash = require('connect-flash')

// const statsRouter = require('./routes/statsRouter')
require('dotenv').config()

const passportConfig = require('./config/passport')
const app = express()
connectDB()

app.use(cors())
app.use(helmet())
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
  }))
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
app.use(passport.initialize())

// app.use(passport.session())
app.use(flash())


// app.use('/v1/user/auth', userRouter)
// app.use('/v1/user/dashboard', passportConfig.isAuthenticated, dashRouter)
// app.use('/stats', statsRoute)

app.get('/', (req, res) => {
    res.send('<h2>“The code is more what you’d call ‘guidelines’ than actual rules.” – Hector Barbossa</h2>')
})
const PORT = 5959 || process.env.PORT
app.listen(PORT, () => console.log(`'Ello ${PORT}.`))