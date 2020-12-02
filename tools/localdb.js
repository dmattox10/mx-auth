const Portal = require('../models/portal')
const User = require('../models/user')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)

const update = async () => {
    const portalsList = await Portal.find()
    portalsList.map(portal => portal.name).sort()
    db.set('service.portals', portalsList).write() // This probably needs promisified
    const usersList = await User.find()
    const serviceCounts = usersList.map(user => user.referrers.map())
}

module.exports = update