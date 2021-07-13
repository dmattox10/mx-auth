const mongoose = require("mongoose")
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const localdb = require('../tools/localdb')
const { MONGO_URI } = require('../env')

const db = low(adapter)

db.defaults({ service: {} }).write()

const connectDB = () => {
    connectWithRetry()
}

const connectWithRetry = async () => {
    return await mongoose.connect(MONGO_URI(), err => {
        if (err) {
            console.error('Failed to connect on startup = retrying in 1 second', err)
            setTimeout(connectWithRetry, 1000)
        }
        console.log("Connected to DB")
        localdb.update()
    })
}

module.exports = connectDB