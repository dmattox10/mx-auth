const User = require('../models/user')
const Token = require('../models/token')
const Portal = require('../models/portal')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend")
const { API_KEY, SEND_DOMAIN, SHARED_SECRET, REFRESH_SECRET } = require('../env')
// const Portal = require('../models/portal')

// TODO Add timestamp verification to prevent replay attacks.
exports.register = async (req, res) => {
    try {
        const { appName, email, password, firstName, lastName } = req.body
        const filter = { email }
        const update = { _id: mongoose.Types.ObjectId(), email, password, firstName, lastName, $addToSet: { referrers: appName } } // MAY NEED TO PUT QUOTES AROUND ADDTOSET
        // const options = { upsert: true }
        User.findOne(filter).then(user => {
            if (!user) {
                new User(update/*, options*/).then(user => {
                    getTokens(user).then(tokens => {
                        user.auth = tokens.auth
                        user.refreshtoken = tokens.refreshtoken
                        user.save().then(newUser=> {
                            const portalFilter = { name: appName }
                            const portalUpdate = { name: appName, $addToSet: { users: mongoose.Types.ObjectId(user._id) } }
                            Portal.findOne(portalFilter).then(portal => {
                                if (!portal) {
                                    portal = new Portal(portalUpdate)
                                    portal.save()
                                }
                                Portal.findOneAndUpdate(portalUpdate)
                                return res
                                    .status(201)
                                    .header('refreshtoken', tokens.refreshtoken)
                                    .header('auth', tokens.auth)
                                    .json({ user })
                            })
                        })
                    }) 
                })
                // return res.status(201).json({ auth, refreshtoken, user })
            } else { // catchall?
                return res.status(400).json({ error: 'User exists' })
            }
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal Server Error!' })
    }
}

async function getTokens(user) {
    let tokens = {}
    return new Promise((resolve, reject) => {
        try {
            user.createauth().then(auth => {
                tokens.auth = auth
                user.createRefreshToken().then(refreshtoken => {
                    tokens.refreshtoken = refreshtoken
                    resolve(tokens)
                })
            })
        } catch (err) {
            console.log('bad juju: ', err)
            reject(err)
        }
    })
}

exports.login = async (req, res) => {
    const { email, password } = req.body
    console.log(email, password)
    try {
        User.findOne({ email: email }).then(user => {
            if (!user) {
                return res.status(404).json({ error: 'No user found!' })
            }
            user.validPassword(password).then(valid => {
                if (!valid) {
                    return res.status(401).json({ error: 'Invalid Password!' })
                }
                getTokens(user).then(tokens => {
                    user.auth = tokens.auth
                    user.refreshtoken = tokens.refreshtoken
                    return res
                        .header('refreshtoken', tokens.refreshtoken)
                        .header('auth', tokens.auth)
                        .json({ user })
                })
            })

        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal Server Error!' })
    }
}

exports.generateRefreshToken = async (req, res) => {
    try {
        const { refreshtoken } = req.body
        if (!refreshtoken) {
            return res.status(403).json({ error: 'Access denied, missing token' })
        } else {
            const tokenDoc = await Token.findOne({ token: refreshtoken })
            if (!tokenDoc) {
                return res.status(401).json({ error: 'Token Expired!' })
            } else {
                const payload = jwt.verify(tokenDoc.token, REFRESH_SECRET)
                const auth = jwt.sign({ user: payload }, SHARED_SECRET, { expiresIn: '10m' })
                return res
                    .status(200)
                    .header('refreshtoken', refreshtoken)
                    .header('auth', auth)
                    .json({ user })
            }
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal Server Error!' })
    }
}

exports.logout = async (req, res) => {
    try {
        const { refreshtoken } = req.body
        await Token.findOneAndDelete({ token: refreshtoken })
        return res.status(200).json({ success: 'User Logged Out.' })
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
            let auth = await user.createauth(300)


            const mailerSend = new MailerSend({
                apiKey: API_KEY,
            });

            const sentFrom = new Sender(`no-reply@${SEND_DOMAIN}`, "no-reply");

            const recipients = [
                new Recipient(email, `${user.firstName}`)
            ];

            const emailParams = new EmailParams()
                .setFrom(sentFrom)
                .setTo(recipients)
                .setReplyTo(sentFrom)
                .setSubject("Magic-Link")
                .setHtml('<strong>Here is the Magic Link you requested</strong>')
                .setText(`https://${portal}.${SEND_DOMAIN}.com/magic?token=${auth}`);

            await mailerSend.email.send(emailParams);
            return res.status(200).json({})
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal Server Error!' })
    }
}