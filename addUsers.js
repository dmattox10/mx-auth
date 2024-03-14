const User = require('./models/user') // Import your custom User model
const Portal = require('./models/portal')
const Token = require('./models/token')
const connectDB = require("./config/db")
// const hashwasm = require('hash-wasm')
// let salt = new Uint8Array(16)
const mongoose = require('mongoose')


connectDB()

let usersToAdd = [
  {
    email: 'user1@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'password1', // Plain text password
    appName: 'moodi',
    _id: '65f1cb91038db3002e109dbc',
  },
  {
    email: 'user2@example.com',
    firstName: 'Alice',
    lastName: 'Smith',
    password: 'password2', // Plain text password
    appName: 'moodi',
    _id: '65f1cb91038db3002e109dbb'
  },
  {
    email: 'user3@example.com',
    firstName: 'Emma',
    lastName: 'Johnson',
    password: 'password3', // Plain text password
    appName: 'moodi',
    _id: '65f1c9a4a1bfa7002edd429f',
  }
]

async function createUsers() {
    await User.deleteMany({})
    await Portal.deleteMany({})
    await Token.deleteMany({})
    for await (let user of usersToAdd) {
      try {
        const portalFilter = { name: user.appName }
        const portalUpdate = { name: user.appName, $addToSet: { users: mongoose.Types.ObjectId(user._id) } }
        Portal.findOne(portalFilter).then(portal => {
          if (!portal) {
              portal = new Portal(portalUpdate)
              portal.save()
          }
          Portal.findOneAndUpdate(portalUpdate)
          let newUser = new User({...user})
          newUser.save()
        })
      } catch (err) {
        console.error('Error creating users:', err)
      }
    }
  }
createUsers()