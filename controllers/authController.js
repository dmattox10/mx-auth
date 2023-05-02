const User = require('../models/user')
const Token = require('../models/token')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend")
const { API_KEY, SEND_DOMAIN, SHARED_SECRET, REFRESH_SECRET } = require('../env')

// TODO Add timestamp verification to prevent replay attacks.
exports.register = async (req, res) => {
    try {
        const { portal, email, password } = req.body
        const filter = { email: email }
        const update = { _id: mongoose.Types.ObjectId(), email: email, password: password, '$addToSet': { referrers: portal } } // MAY NEED TO PUT QUOTES AROUND ADDTOSET
        const options = { upsert: true }
        let user = await User.findOne(filter)
        if (user) {
            return res.status(400).json({ error: 'User exists'})
        } else {
            user = new User(update, options)
            let accessToken = await user.createAccessToken()
            let refreshToken = await user.createRefreshToken()
            await user.save()
            const portalFilter = { name: portal }
            const portalUpdate = { '$addToSet': { users: user._id }}
            return res.status(201).json({ accessToken, refreshToken, special })
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal Server Error!'})
    }
}

exports.login = async (req, res) => {
    try {
        let user = await User.findOne({ email: email })
        if (!user) {
            res.status(404).json({ error: 'No user found!' })
        } else {
            let valid = user.validPassword(password)
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

exports.magic = async (req, res) => {
  const { email, portal } = req.body
  try {
    let user = await User.findOne({ email: email })
    if (!user) {
        res.status(404).json({ error: 'No user found!' }) // Tell the front end to lie
    } else {
      let accessToken = await user.createAccessToken(300)
      

    const mailerSend = new MailerSend({
      apiKey: API_KEY,
    });

    const sentFrom = new Sender(`no-reply@${SEND_DOMAIN}`, "no-reply");

    const recipients = [
      new Recipient(email, `${user.firstName} ${user.lastname}`)
    ];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject("Magic-Link")
      .setHtml('<strong>Here is the Magic Link you requested</strong>')
      .setText(`https://${portal}.${SEND_DOMAIN}.com/magic?token=${accessToken}`);

    await mailerSend.email.send(emailParams);
          return res.status(200).send()
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal Server Error!' })
    }
}