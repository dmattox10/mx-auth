const mongoose = require('mongoose')
const Token = require('./token')
const jwt = require('jsonwebtoken')
const findOrCreate = require('mongoose-findorcreate')
const { SHARED_SECRET, REFRESH_SECRET } = require('../env')
const hashwasm = require('hash-wasm')
let salt = new Uint8Array(16)
globalThis.crypto.getRandomValues(salt)   

// define the schema for our user model
// TODO Add objects for other social signins
const userSchema = new mongoose.Schema({

    email: { type: String, required: true, unique: true },
    firstName: {type: String, required: true },
    lastName: {type: String, required: true },
    password: { type: String, required: true },
    referrers: { type : Array, required: false }

})

// generating a hash

userSchema.plugin(findOrCreate)



// userSchema.pre('save', async function(next) {
    
//     next();
  
//   })

  userSchema.pre('save', async function(next) { 
    const hashedPassword = await hashwasm.argon2i({password: user.password,
        salt, // salt is a buffer containing random bytes
    parallelism: 1,
    iterations: 256,
    memorySize: 512, // use 512KB memory
    hashLength: 32, // output size = 32 bytes
    outputType: 'encoded'})
    this.password = hashedPassword
    console.log(this)
    next()
    })

userSchema.methods = {
    createAccessToken: async function (time) {
        try {
            let { _id, email } = this
            let accessToken = jwt.sign(
                { user: { _id, email } },
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
            let { _id, email } = this
            let refreshToken = jwt.sign(
                { user: { _id, email } },
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
    hashPassword: async function(password) {
        let hash
        try {
      
            hash = await hashwasm.argon2i({password: password,
                parallelism: 1,
                iterations: 256,
                memorySize: 512, // use 512KB memory
                hashLength: 32, // output size = 32 bytes
                outputType: 'encoded'})
      
        } catch(err){
      
          // error handling here
          console.log(err)
      
        }
        return hash;
      },
    validPassword: async function (formPassword) {
        const isValid = await hashwasm.argon2Verify({password: formPassword,  hash: this.password})
        return isValid
    }
}
const User = mongoose.model('Users', userSchema)
module.exports = User