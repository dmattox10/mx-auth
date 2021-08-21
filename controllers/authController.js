const User = require('../models/user')
const Middleware = require('../middlewares')
const Token = require('../models/token')
const jwt = require('jsonwebtoken')
const { SHARED_SECRET, REFRESH_SECRET } = require('../env')

// TODO Add timestamp verification to prevent replay attacks.
exports.register = async (req, res) => {
    try {
        console.log(req.body)
        const { special } = req.body
        const filter = { username: req.body.username }
        const update = { username: req.body.username, password: req.body.password, '$addToSet': { referrers: req.body.referrer } } // MAY NEED TO PUT QUOTES AROUND ADDTOSET
        const options = { upsert: true }
        let user = await User.findOne(filter)
        if (user) {
            return res.status(400).json({ error: 'User exists'})
        } else {
            user = new User(update, options)
            let accessToken = await user.createAccessToken()
            let refreshToken = await user.createRefreshToken()
            await user.save()
            return res.status(201).json({ accessToken, refreshToken, special })
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal Server Error!'})
    }
}

exports.login = async (req, res) => {
    try {
        console.log(req.body)
        let user = await User.findOne({ username: req.body.username })
        if (!user) {
            res.status(404).json({ error: 'No user found!' })
        } else {
            let valid = user.validPassword(req.body.password)
            if (valid) {
                let accessToken = await user.createAccessToken()
                let refreshToken = await user.createRefreshToken()
                return res.status(200).json({ accessToken, refreshToken })
            } else {
                return res.status(401).json({ error: 'Invalid Password!'})
            }
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal Server Error!' })
    }
}

exports.generateRefreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body
        if (!refreshToken) {
            return res.status(403).json({ error: 'Access denied, missing token'})
        } else {
            const tokenDoc = await Token.findOne({ token: refreshToken })
            if (!tokenDoc) {
                return res.status(401).json({ error: 'Token Expired!' })
            } else {
                const payload = jwt.verify(tokenDoc.token, REFRESH_SECRET)
                const accessToken = jwt.sign({ user: payload }, SHARED_SECRET, { expiresIn: '10m' })
                return res.status(200).json({ accessToken })
            }
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal Server Error!' })
    }
}

exports.logout = async (req, res) => {
    try {
        const { refreshToken } = req.body
        await Token.findOneAndDelete({ token: refreshToken })
        return res.status(200).json({ success: 'User Logged Out.'})
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal Server Error!' })
    }
}