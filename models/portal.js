const mongoose = require('mongoose')
const findOrCreate = require('mongoose-findorcreate')
mongoose.set('useFindAndModify', false)

const portalSchema = mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    users: {
        type: [mongoose.Types.ObjectId]
    }

})  

portalSchema.plugin(findOrCreate)

module.exports = mongoose.model('Portal', portalSchema)