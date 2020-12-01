const express = require('express')
const passport = require('passport')
const Cors = require('cors')
const ExpressBrute = require('express-brute')

const authRouter = express.Router()
const store = new ExpressBrute.MemoryStore()
const bruteforce = new ExpressBrute(store)

authRouter.post('/signup', Cors(), bruteforce.prevent, passport.authenticate('local-signup'), (req, res) => {
    if (req.user) {
        res.status(201).json(req.user)
    }
    else {
        res.status(500).json(req)
    }
})

authRouter.post('/login', Cors(), bruteforce.prevent, passport.authenticate('local-login'), (req, res) => {
    if (req.user) {
        res.status(200).json(req.user)
    }
    else {
        res.status(500).json(req)
    }

})

authRouter.get('/facebook', Cors(), bruteforce.prevent, passport.authenticate('facebook'), (req, res) => {
    if (req.user) {
        res.status(200).json(req.user)
    }
    else {
        res.status(500).json(req)
    }
})

module.exports = authRouter