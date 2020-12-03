const express = require('express')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const Cors = require('cors')
const ExpressBrute = require('express-brute')

const authRouter = express.Router({ mergeParams: true }) 
const store = new ExpressBrute.MemoryStore()
const bruteforce = new ExpressBrute(store)

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || 'ThisIsNotProdDontWorryAboutIt'

const User = require('../models/user')
const Portal = require('../models/portal')

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

authRouter.get('/app/:referrer', Cors(), bruteforce.prevent, passport.authenticate('jwt', { session: false }), async (req, res) => {
    const referrer = req.params.referrer
    if (req.user) {
        User.findByIdAndUpdate({ _id: req.user._id }, { $addToSet: { referrers: referrer } }, (err, user) => { // May beed to be req.user._id !!!
            const methodDotNotation = `logins.${user.method}`
            let info = { $addToSet: {}, $inc: {} }
            info.$addToSet = { users: user._id }
            info.$inc[methodDotNotation] = 1
            const portal = await Portal.findOneAndUpdate({ name: referrer }, info, {
                new: true,
                upsert: true
            })
            console.log(portal) // TODO We can get rid of this eventually !!
            return res.status(200).json({
                status: 'done'
            })
        })
  
    }
    else {
        return res.status(500).json(req) // Do I want 401's on all of these instead?
    }
})

authRouter.get('/facebook', Cors(), bruteforce.prevent, passport.authenticate('facebook'))

authRouter.get('/facebook/callback', Cors(), bruteforce.prevent, passport.authenticate('facebook'), (req, res) => {
    if (req.user) {
        const token = sign(user)
        return res.status(200).json({
            token: `JWT ${token}`
        })
    }
    else {
        return res.status(500).json(req)
    }
})

authRouter.get('/github', Cors(), bruteforce.prevent, passport.authenticate('github'))

authRouter.get('/github/callback', Cors(), bruteforce.prevent, passport.authenticate('github'), (req, res) => {
    if (req.user) {
        const token = sign(user)
        return res.status(200).json({
            token: `JWT ${token}`
        })
    }
    else {
        return res.status(500).json(req)
    }
})

authRouter.get('/google', Cors(), bruteforce.prevent, passport.authenticate('google'))

authRouter.get('/google/callback', Cors(), bruteforce.prevent, passport.authenticate('google'), (req, res) => {
    if (req.user) {
        const token = sign(user)
        return res.status(200).json({
            token: `JWT ${token}`
        })
    }
    else {
        return res.status(500).json(req)   
    }
})

authRouter.get('/twitter', Cors(), bruteforce.prevent, passport.authenticate('twitter'))

authRouter.get('/twitter/callback', Cors(), bruteforce.prevent, passport.authenticate('twitter'), (req, res) => {
    if (req.user) {
        const token = sign(user)
        return res.status(200).json({
            token: `JWT ${token}`
        })
    }
    else {
        return res.status(500).json(req)
    }
})

const sign = user => {
    jwt.sign(user, accessTokenSecret, {
        expiresIn: 3600
    }, (err, token) => {
        if (err) {
            console.error(`Token error: ${err}`)
        }
        else {
            return token
        }
    })
}

module.exports = authRouter