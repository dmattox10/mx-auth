const mongoose = require("mongoose")
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const localdb = require('../tools/localdb')
require('dotenv').config()

const db = low(adapter)

db.defaults({ service: {} }).write()


// TODO add retry connect
const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to DB")
        localdb.update()
    }catch(err){
        console.error(err.message)
    }
}

module.exports = connectDB