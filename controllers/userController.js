const jwt = require('jsonwebtoken')
const cuid = require('cuid')

const knex = require('../knex/knex')
const { REFRESH_SECRET, SHARED_SECRET } = require('../env')

exports.register = async (req, res) => {
  const { email, hashedPassword, portal } = req.body
  console.log(portal)
  if (!email || !hashedPassword || !portal) {
    return res.status(400).json({ err: 'All fields required.' })
  }

  try {
    const userCuid = cuid()
    let portals = []
    portals.push(portal)
    const [user] = await knex
      .table('users')
      .insert({
        hashedPassword,
        portals,
        email,
        userCuid
      })
      .returning('*')

    return res.status(200).json(user)
  } catch (err) {
    const error = new Error(err)

    return res.status(500).json({ err: error.message })
  }
}

exports.login = async (req, res) => {
  const { email, hashedPassword, portal, userCuid } = req.body

  if (!email || !hashedPassword) {
    return res.status(400).json({ err: 'All fields required.' })
  }

  try {
    const [user] = await knex
      .table('users')
      .where('email', email)

    if (hashedPassword === user.hashedPassword) {
      // safe place to edit the unning list of which of the services auth is mx-auth is used for that this user uses
      if (!user.portals.includes(portal)) {
        let portalsCopy = [...user.portals]
        portalsCopy.push(portal)
        const changes = {
          portals: portalsCopy
        }
        const editedUser = await knex
          .table('users')
          .where('email', email)
          .update(changes)
      }
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
          .update({ 
            activeToken: refreshToken,
            userCuid: userCuid })
          .where('userId', user.id)
      } else {
        await knex.table('tokens').insert({
          userId: user.id,
          activeToken: refreshToken,
          userCuid: userCuid
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
