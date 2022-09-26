const express = require('express')
// const Cors = require('cors')
const ExpressBrute = require('express-brute')
const authController = require('../controllers/authController')
const authRouter = express.Router({ mergeParams: true })
const store = new ExpressBrute.MemoryStore()
const bruteforce = new ExpressBrute(store)

authRouter.get('/refresh', Cors(), bruteforce.prevent, authController.refresh)

authRouter.delete('/logout', Cors(), bruteforce.prevent, authController.logout)

authRouter.post('/register', Cors(), bruteforce.prevent, authController.register)

authRouter.post('/login', Cors(), bruteforce.prevent, authController.login)

authRouter.post('/magic', Cors(), bruteforce.prevent, authController.magic)

module.exports = authRouter
