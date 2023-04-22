const mongoose = require('mongoose')
const findOrCreate = require('mongoose-findorcreate')
mongoose.set('useFindAndModify', false)

const portalSchema = mongoose.Schema({

    name: String,
    users: Number,

})

portalSchema.plugin(findOrCreate)

module.exports = mongoose.model('Portal', portalSchema)