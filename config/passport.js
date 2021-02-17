const passport = require('passport')
// TODO comment out all of the LOCAL stuff once the other auth methods are working!
const LocalStrategy = require('passport-local').Strategy

const JWTStrategy = require('passport-jwt').Strategy
const ExtractJWT = require('passport-jwt').ExtractJwt
const FacebookStrategy = require('passport-facebook').Strategy
const GitHubStrategy = require('passport-github2').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy
const TwitterStrategy = require('passport-twitter').Strategy

const { 
    SHARED_SECRET,
    FACEBOOK_APP_ID,
    FACEBOOK_APP_SECRET,
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    TWITTER_CONSUMER_KEY,
    TWITTER_CONSUMER_SECRET,
} = require('../env')

require('dotenv').config()

const User = require('../models/user')

// const accessTokenSecret = SHARED_SECRET || 'ThisIsNotProdDontWorryAboutIt'
const opts = {
    jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme('JWT'),
    secretOrKey: SHARED_SECRET || 'ThisIsNotProdDontWorryAboutIt'
}

// passport.serializeUser(function(user, done) {
//     done(null, user.id)
// })
    
// passport.deserializeUser(function(id, done) {
//     User.findById(id, function(err, user) {
//     done(err, user)
//     })
// })

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

passport.use('jwt', new JWTStrategy(opts, (jwt_payload, done) => {
    User.findById(jwt_payload._id).then(user => { // _id vs id ??
        if (user) {
            return done(null, user)
        }
        else {
            return done(null, false)
        }
    }).catch(err => console.error(err))
}))

passport.use('facebook', new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: '/v1/auth/facebook/callback' // May need full URL
}, (accessToken, refreshToken, profile, cb) => {
    User.findOrCreate({
        'facebook.id': profile.id
    }, {
        'facebook.token': profile.token, // May need to change to 'accessToken'
        'facebook.name': profile.name,
        'facebook.email': profile.email,
        'role': 'user',
        'method': 'facebook'
    }, (err, user) => {
        return cb(err, user)
    })
}))

passport.use('github', new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: '/v1/auth/github/callback'
}, (accessToken, refreshToken, profile, done) => {
    User.findOrCreate({
        'github.id': profile.id
    }, {
        'github.token': profile.token, // May need to change to 'accessToken'
        'method': 'github'
    }, (err, user) => {
        return done(err, user)
    })
}))

passport.use('google', new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: '/v1/auth/google/callback' // May need full URL
}, (accessToken, refreshToken, profile, cb) => {
    User.findOrCreate({
        'google.id': profile.id
    }, {
        'google.token': profile.token, // May need to change to 'accessToken'
        'google.email': profile.email,
        'google.name': profile.name,
        'role': 'user',
        'method': 'google'
    },(err, user) => {
        return cb(err, user)
    })
}))

passport.use('twitter', new TwitterStrategy({
    consumerKey: TWITTER_CONSUMER_KEY,
    consumerSecret: TWITTER_CONSUMER_SECRET,
    callbackURL: '/v1/auth/twitter/callback' // May need full URL
}, (token, tokenSecret, profile, cb) => {
    User.findOrCreate({
        'twitter.id': profile.id
    }, {
        'twitter.token': profile.token, // May need to change to 'accessToken'
        'twitter.displayName': profile.displayName,
        'twitter.username': profile.username,
        'role': 'user',
        'method': 'twitter'
    }, (err, user) => {
        return cb(err, user)
    })
}))

// exports.isAuthenticated = (req, res, next) => {
//     if (req.isAuthenticated()) {
//       return next()
//     }
//     res.status(401).json('You must be logged in to do that.')
//   }

// TODO get rid of this once all the social logins are working
const createUserWithPrefs = async (username, password) => { // This will eventually need modified for all the social logins....
    let newUser = new User()
    newUser.local.username = username
    newUser.local.password = newUser.generateHash(password)
    
    await newUser.save()
    return newUser
}
