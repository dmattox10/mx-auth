const knex = require('knex')
const jwt = require('jsonwebtoken')

const { REFRESH_SECRET, SHARED_SECRET } = require('../env')
exports.refresh = async (req, res) => {
  const { refreshToken } = req.headers

  try {
    const { id } = jwt.verify(
      refreshToken,
      `${REFRESH_SECRET}`
    )

    const [user] = await knex
      .table('tokens')
      .where('userId', id)
      .limit(1)

    if (user.activeToken === refreshToken) {
      const accessToken = jwt.sign(
        {
          id: user.userId,
          role: 'user'
        },
        `${SHARED_SECRET}`
      )

      return res.status(200).json({ accessToken })
    }

    return res.status(400).json({ err: 'Token expired' })
  } catch (err) {
    const error = new Error(err)

    return res.status(500).json({ err: error.message })
  }
}

exports.logout = async (req, res) => {
  const { accessToken } = req.headers
  try {
    const { id } = jwt.verify(
      accessToken,
      `${SHARED_SECRET}`
    )
    if (id) {
      await knex
        .table('tokens')
        .where('userId', id)
        .limit(1)
        .delete()
      return res.status(204)
    }
    return res.status(404).json({ err: 'matching user with active session does not exist!' })
  } catch (err) {
    const error = new Error(err)

    return res.status(500).json({ err: error.message })
  }
}
