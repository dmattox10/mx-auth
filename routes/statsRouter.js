const express = require('express')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const Cors = require('cors')
const db = low(adapter)
const ExpressBrute = require('express-brute')
const store = new ExpressBrute.MemoryStore()
const bruteforce = new ExpressBrute(store)
const Middleware = require('../middlewares')

// if (!db.has('visits').value()) {
//     db.defaults({ visits: 0 })
//     .write()
// }

const statsRouter = express.Router()

statsRouter.get('/', Cors(), bruteforce.prevent, async (req, res) => {
    // TODO Load from flat file here!
    res.status(200).json()
})

statsRouter.post('/app', Cors(), bruteforce.prevent, Middleware.checkauth, async (req, res) => {
    const referrer = req.body.referrer
    // TODO JWT Check here!
    if (req.user) {
        User.findByIdAndUpdate({ _id: req.user._id }, { $addToSet: { referrers: referrer } }, async (err, user) => { // May beed to be req.user._id !!!
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
        return res.status(401).json(req) // Do I want 401's on all of these instead?
    }
})

module.exports = statsRouter