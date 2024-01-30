const User = require('./models/user') // Import your custom User model
const connectDB = require("./config/db")
const hashwasm = require('hash-wasm')
let salt = new Uint8Array(16)


connectDB()

let usersToAdd = [
  {
    email: 'user1@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'password1', // Plain text password
  },
  {
    email: 'user2@example.com',
    firstName: 'Alice',
    lastName: 'Smith',
    password: 'password2', // Plain text password
  },
  {
    email: 'user3@example.com',
    firstName: 'Emma',
    lastName: 'Johnson',
    password: 'password3', // Plain text password
  }
]

async function createUsers() {
    await User.deleteMany({})
    for await (let user of usersToAdd) {
      try {
        let newUser = new User({...user})
        newUser.save()
      } catch (err) {
        console.error('Error creating users:', err)
      }
    }
  }
createUsers()