const express = require('express')
const Cors = require('cors')
const ExpressBrute = require('express-brute')
const profileController = require('../controllers/profileController')
const profileRouter = express.Router({ mergeParams: true }) 
const store = new ExpressBrute.MemoryStore()
const bruteforce = new ExpressBrute(store)

profileRouter.get('/:id', Cors(), bruteforce.prevent, profileController.getUser)

// profileRouter.post('/login', Cors(), bruteforce.prevent, profileController.login)

// profileRouter.post('/refresh', Cors(), bruteforce.prevent, profileController.generateRefreshToken)

// profileRouter.delete('/logout', profileController.logout)

module.exports = profileRouter