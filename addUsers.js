const User = require('./models/user'); // Import your custom User model
const connectDB = require("./config/db")
const hashwasm = require('hash-wasm')
let salt = new Uint8Array(16)


connectDB()

const usersToAdd = [
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
];
// Function to create users

async function hashPassword(password) {
  let hash
  try {
    globalThis.crypto.getRandomValues(salt)   
    hash = await hashwasm.argon2i({password: password, parallelism: 1,
      iterations: 256,
      memorySize: 512, // use 512KB memory
      hashLength: 32, // output size = 32 bytes
      outputType: 'encoded',
      salt})

  } catch(err){

    // error handling here
    console.log(err)

  }
  return hash;
}
async function createUsers () {

    usersToAdd.forEach(async user => {
      console.log(user.password)
      const hashedPassword = await hashPassword(user.password)
      user.password = hashedPassword
      console.log(user.password)
    })
    try {
      await User.deleteMany({})
      User.insertMany(usersToAdd)
      console.log('Users created.');
    } catch (error) {
      console.error('Error creating users:', error);
    }
  };
createUsers()