const express = require('express')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const Cors = require('cors')
const db = low(adapter)
const ExpressBrute = require('express-brute')
const bruteforce = new ExpressBrute(store)

// if (!db.has('visits').value()) {
//     db.defaults({ visits: 0 })
//     .write()
// }

const statsRouter = express.Router()

statsRouter.get('/', Cors(), bruteforce.prevent, async (req, res) => {
    // Load from flat file here!
    res.status(200).json()
})

module.exports = statsRouter