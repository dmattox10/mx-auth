const mongoose = require("mongoose");
require('dotenv').config()

// TODO add retry connect
const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");
    }catch(err){
        console.error(err.message);
    }
}

module.exports = connectDB;