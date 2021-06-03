const User = require('../models/user')
const Middleware = require('../middlewares')
const Token = require('../models/token')
const jwt = require('jsonwebtoken')
const { SHARED_SECRET, REFRESH_SECRET } = require('../env')

exports.register = async (req, res) => {
    try {
        let user = await User.findOne({ username: req.body.username })
        if (user) {
            return res.status(400).json({ error: 'User exists'})
        } else {
            user = await new User(req.body).save()
            let accessToken = await user.createAccessToken()
            let refreshToken = await user.createRefreshToken()

            return res.status(201).json({ accessToken, refreshToken })
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal Server Error!'})
    }
}

exports.login = async (req, res) => {
    try {
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