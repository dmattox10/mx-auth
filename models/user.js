const mongoose = require('mongoose')
const Token = require('./token')
const jwt = require('jsonwebtoken')
const findOrCreate = require('mongoose-findorcreate')
const { SHARED_SECRET, REFRESH_SECRET } = require('../env')

// define the schema for our user model
// TODO Add objects for other social signins
const userSchema = new mongoose.Schema({

    email: { type: String, required: true, unique: true },
    firstName: {type: String, required: true },
    lastName: {type: String, required: true },
    password: { type: String, required: true },
    portals        : Set,
    role             : String

})

// generating a hash

userSchema.plugin(findOrCreate)

userSchema.methods = {
    createAccessToken: async function (time) {
        try {
            let { _id, email } = this
            let accessToken = jwt.sign(
                { user: { _id, email } },
                SHARED_SECRET,
                {
                expiresIn: time || "10m",
                }
            )
            return accessToken
            } catch (error) {
                console.error(error)
                return
            }
    },
    createRefreshToken: async function () {
        try {
            let { _id, email } = this
            let refreshToken = jwt.sign(
                { user: { _id, email } },
                REFRESH_SECRET,
                {
                    expiresIn: time || "30d",
                }
            )
            await new Token({ token: refreshToken }).save()
            return refreshToken
        } catch (error) {
            console.error(error)
            return
        }
    },
}

module.exports = mongoose.model('User', userSchema)