const mongoose = require('mongoose')
const findOrCreate = require('mongoose-findorcreate')
mongoose.set('useFindAndModify', false)

const portalSchema = mongoose.Schema({

    name: String,
    users: Array,
    logins: {
        deviantart: Number,
        facebook: Number,
        github: Number,
        google: Number,
        linkedin: Number,
        lyft: Number,
        reddit: Number,
        spotify: Number,
        steam: Number,
        twitter: Number,
        uber: Number
    }

})

portalSchema.plugin(findOrCreate)

portalSchema.methods.totalLogins = () => {
    return this.logins.deviantart + this.logins.facebook + this.logins.github + this.logins.google + this.logins.linkedin + this.logins.lyft + this.logins.reddit + this.logins.spotify + this.logins.steam + this.logins.twitter + this.logins.uber
}

module.exports = mongoose.model('Portal', portalSchema)