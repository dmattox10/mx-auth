const express = require('express')
// const jwt = require('jsonwebtoken')
const Cors = require('cors')
const ExpressBrute = require('express-brute')
const authController = require('../controllers/authController')
const userController = require('../controllers/userController')
const authRouter = express.Router({ mergeParams: true })
const store = new ExpressBrute.MemoryStore()
const bruteforce = new ExpressBrute(store)

authRouter.get('/refresh', Cors(), bruteforce.prevent, authController.refresh)

authRouter.delete('/logout', Cors(), bruteforce.prevent, authController.logout)

authRouter.post('/register', Cors(), bruteforce.prevent, userController.register)

authRouter.post('/login', Cors(), bruteforce.prevent, userController.login)

module.exports = authRouter
