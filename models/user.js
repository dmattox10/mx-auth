const mongoose = require('mongoose')
const Token = require('./token')
const jwt = require('jsonwebtoken')
const findOrCreate = require('mongoose-findorcreate')
const { SHARED_SECRET, REFRESH_SECRET } = require('../env')
const hashwasm = require('hash-wasm')
let salt = new Uint8Array(16)
globalThis.crypto.getRandomValues(salt)

// define the schema for our user model
const userSchema = new mongoose.Schema({

    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    referrers: { type: [mongoose.Types.ObjectId], required: false }

})

// generating a hash

userSchema.plugin(findOrCreate)



// userSchema.pre('save', async function(next) {

//     next();

//   })

userSchema.pre('save', async function (next) {
    const hashedPassword = await hashwasm.argon2i({
        password: this.password,
        salt, // salt is a buffer containing random bytes
        parallelism: 1,
        iterations: 256,
        memorySize: 512, // use 512KB memory
        hashLength: 32, // output size = 32 bytes
        outputType: 'encoded'
    })
    this.password = hashedPassword
    next()
})

userSchema.methods = {
        createauth: async function (time) {
            return new Promise((resolve, reject) => {
                try {
                    let { _id, email } = this
                    console.log(email)
                    let auth = jwt.sign(
                        { user: { _id, email } },
                        SHARED_SECRET,
                        {
                            expiresIn: time || "10m",
                        }
                    )
                    resolve(auth)
                } catch (error) {
                    reject(error)
                }
            })
        },
        createRefreshToken: async function () {
            try {
                let { _id, email } = this
                let refreshtoken = jwt.sign(
                    { user: { _id, email } },
                    REFRESH_SECRET,
                    {
                        expiresIn: "30d",
                    }
                )
                await new Token({ token: refreshtoken }).save()
                return refreshtoken
            } catch (error) {
                console.error(error)
                return
            }
        },
        hashPassword: async function(password) {
            let hash
            try {

                hash = await hashwasm.argon2i({
                    password: password,
                    parallelism: 1,
                    iterations: 256,
                    memorySize: 512, // use 512KB memory
                    hashLength: 32, // output size = 32 bytes
                    outputType: 'encoded'
                })

            } catch (err) {

                // error handling here
                console.log(err)

            }
            return hash;
        },
        validPassword: async function (formPassword) {
            const isValid = await hashwasm.argon2Verify({ password: formPassword, hash: this.password })
            return isValid
        }
    }
const User = mongoose.model('Users', userSchema)
module.exports = User