const mongoose = require('mongoose')
const argon2 = require('argon2')
// define the schema for our user model
// TODO Add objects for other social signins
const userSchema = mongoose.Schema({

    local            : {
        username     : String,
        password     : String,
    },
    facebook         : {
        id           : String,
        token        : String,
        name         : String,
        email        : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    referrer         : String,
    role             : String

})

// generating a hash
userSchema.methods.generateHash = async password => {
    const hash = await argon2.hash(password)
    return hash
}

// checks if password is valid
userSchema.methods.validPassword = async password => {
    const valid = await argon2.verify(this.local.password, password)
    return valid
}

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema)