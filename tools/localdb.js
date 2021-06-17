const Portal = require('../models/portal')
const User = require('../models/user')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)
// TODO do something with all the data to create the stats for the dashboard!
const update = async () => {
    const portalsList = await Portal.find()
    db.set('service.portals', portalsList).write() // This probably needs promisified
}

module.exports = { update }