const knex = require('knex')

const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const { REFRESH_SECRET, SHARED_SECRET } = require('../env')

exports.register = async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ err: 'All fields required.' })
  }

  try {
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
      .toString('hex')

    const [user] = await knex
      .table('users')
      .insert({
        hash,
        salt,
        username
      })
      .returning('*')

    return res.status(200).json(user)
  } catch (err) {
    const error = new Error(err)

    return res.status(500).json({ err: error.message })
  }
}

exports.login = async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ err: 'All fields required.' })
  }

  try {
    const [user] = await knex
      .table('users')
      .where('username', username)

    const hash = crypto
      .pbkdf2Sync(password, user.salt, 1000, 64, 'sha512')
      .toString('hex')

    if (hash === user.hash) {
      const accessToken = jwt.sign(
        {
          id: user.id,
          role: 'user'
        },
        `${SHARED_SECRET}`,
        {
          expiresIn: '24h'
        }
      )
      const refreshToken = jwt.sign(
        {
          id: user.id
        },
        `${REFRESH_SECRET}`
      )

      const [actToken] = await knex
        .table('tokens')
        .where('userId', user.id)

      if (actToken) {
        await knex
          .table('tokens')
          .update({ activeToken: refreshToken })
          .where('userId', user.id)
      } else {
        await knex.table('tokens').insert({
          userId: user.id,
          activeToken: refreshToken
        })
      }

      return res.status(200).json({ accessToken, refreshToken })
    }

    return res.status(400).json({ err: 'Incorrect password.' })
  } catch (err) {
    const error = new Error(err)

    return res.status(500).json({ err: error.message })
  }
}
