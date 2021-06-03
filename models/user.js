const mongoose = require('mongoose')
const argon2 = require('argon2')
const Token = require('./token')
const jwt = require('jsonwebtoken')
const findOrCreate = require('mongoose-findorcreate')
const { SHARED_SECRET, REFRESH_SECRET } = require('../env')

// define the schema for our user model
// TODO Add objects for other social signins
const userSchema = new mongoose.Schema({

    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    referrers        : Array,
    method           : String,
    role             : String

})

// generating a hash

userSchema.plugin(findOrCreate)

userSchema.methods = {
    generateHash : async function (reqPassword) {
        const hash = await argon2.hash(reqPassword)
        return hash
    },
    validPassword : async function (reqPassword) {
        const valid = await argon2.verify(this.password, reqPassword)
        return valid
    },
    createAccessToken: async function () {
        try {
            let { _id, username } = this
            let accessToken = jwt.sign(
                { user: { _id, username } },
                SHARED_SECRET,
                {
                expiresIn: "10m",
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
            let { _id, username } = this
            let refreshToken = jwt.sign(
                { user: { _id, username } },
                REFRESH_SECRET,
                {
                    expiresIn: "30d",
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

userSchema.pre('save', async function (next) {
    try {
        const HASH = await argon2.hash(this.password)
        this.password = HASH
    } catch (error) {
        console.error(error)
    }
    return next()
})

// userSchema.methods.generateHash = async password => {
//     const hash = await argon2.hash(password)
//     return hash
// }

// checks if password is valid
// userSchema.methods.validPassword = async password => {
//     const valid = await argon2.verify(this.local.password, password)
//     return valid
// }

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema)