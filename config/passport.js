const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const TwitterStrategy = require('passport-twitter').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const GoogleStrategy = require('passport-google-oauth').Strategy

const User = require('../models/user')

passport.serializeUser(function(user, done) {
    done(null, user.id)
})
    
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
    done(err, user)
    })
})

passport.use('local-signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, (req, username, password, done) => {
    process.nextTick(() => {
        User.findOne({ 'local.username' : username}, async (err, user) => {
            if (err) {
                return done(err)
            }

            if (user) {
                return done(null, false)
            }
            else {
                const newUser = await createUserWithPrefs(username, password)
                return done(null, newUser)
            }
        })
    })
}))
passport.use('local-login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, (req, username, password, done) => {
    User.findOne({ 'local.username':username }, (err, user) => {
        if (err)
            return done(err)
        if (!user)
            return done(null, false)
        if (!user.validPassword(password))
            return done(null, false)
        return done(null, user)
    })
}))

exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    }
    res.status(401).json('You must be logged in to do that.')
  }

const createUserWithPrefs = async (username, password) => { // This will eventually need modified for all the social logins....
    let newUser = new User()
    newUser.local.username = username
    newUser.local.password = newUser.generateHash(password)
    
    await newUser.save()
    return newUser
}
