const express = require('express')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const cors = require('cors')
const db = low(adapter)

if (!db.has('visits').value()) {
    db.defaults({ visits: 0 })
    .write()
}

const statsRouter = express.Router()

statsRouter.get('/', cors(), async (req, res) => {

    res.status(200).json()
})

statssRouter.get('/up', cors(), async (req, res) => {
    // TODO Do basic operations to make sure things like the DB are working, and report that
    res.status(200).json({
        status: 'ok'
    })
})

module.exports = statsRouter