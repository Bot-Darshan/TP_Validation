const { to } = require('await-to-js')
const R = require('ramda')
const { deleteSchema } = require('./schema.js')

const db = require.main.require('./helpers/db.js')
const logger = require.main.require('./helpers/logger.js')

const deleteComment = async (req, res) => {
  const { id } = req.params

  // Validate input with Joi schema
  const { error: schemaErr, value: body } = deleteSchema.validate(req.body)
  if (!R.isNil(schemaErr)) {
    const error = `Error in input (err: ${schemaErr})`
    logger.error(error)
    return res.status(400).json({ error })
  }

  const [usersErr, users] = await to(db('users')
    .select()
    .where((builder) =>builder.where('id', '=', `${body.users_id}`),),)
  if (!R.isNil(usersErr)) {
    logger.error(`${usersErr}`)
    return res.status(500).json({ error: `${usersErr}` })
  }
  if(users.length == 0){
    return res.status(500).json({ error: `No user with id ${body.users_id}` })
  }
  if(users[0].is_admin == false){
    return res.status(500).json({ error: `User id ${body.users_id} is not Admin` })
  }

  const [commentErr, comment] = await to(
    db('comment').del().where({ id }).returning('*'),
  )
  if (!R.isNil(commentErr)) {
    logger.error(commentErr)
    return res.status(500).json({ error: `${commentErr}` })
  }

  if (R.isEmpty(comment)) {
    const error = `No comment for id ${id}`
    logger.error(error)
    return res.status(500).json({ error })
  }

  return res.status(200).json(comment[0])
}

module.exports = {deleteComment}
