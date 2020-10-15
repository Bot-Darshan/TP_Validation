const { to } = require('await-to-js')
const R = require('ramda')

const db = require.main.require('./helpers/db.js')
const logger = require.main.require('./helpers/logger.js')
const { createSchema, deleteSchema } = require('./schema.js')

const getAll = async (req, res) => {
  
  const { title } = req.query

  const [articleErr, article] = await to(
    db('vw_article')
      .select()
      .where((builder) =>
        !R.isNil(title)
          ? builder.where('title', 'like', `%${title}%`)
          : builder,
      ),
  )
  if (!R.isNil(articleErr)) {
    logger.error(articleErr)
    return res.status(500).json({ error: `${articleErr}` })
  }

  return res.status(200).json(article)
}

const getById = async (req, res) => {
  const { id } = req.params

  const [articleErr, article] = await to(db('vw_article').select().where({ id }))
  if (!R.isNil(articleErr)) {
    logger.error(`${articleErr}`)
    return res.status(500).json({ error: `${articleErr}` })
  }

  const [commentsErr, comments] = await to(db('comment').select().where({ article_id: id }))
  if (!R.isNil(commentsErr)) {
    logger.error(`${commentsErr}`)
    return res.status(500).json({ error: `${commentsErr}` })
  }

  if (R.isEmpty(article)) {
    const error = `No article for id ${id}`
    logger.error(error)
    return res.status(400).json({ error })
  }

  return res.status(200).json({ ...article[0], comments })
}

const createArticle = async (req, res) => {
  // Validate input with Joi schema
  const { error: schemaErr, value: body } = createSchema.validate(req.body)
  const user_id = body.users_id;
  if (!R.isNil(schemaErr)) {
    const error = `Error in input (err: ${schemaErr})`
    logger.error(error)
    return res.status(400).json({ error })
  }
  
  const [usersErr, users] = await to(db('users')
    .select()
    .where((builder) =>builder.where('id', '=', `${user_id}`),),)
  if (!R.isNil(usersErr)) {
    logger.error(`${usersErr}`)
    return res.status(500).json({ error: `${usersErr}` })
  }
  if(users.length == 0){
    return res.status(500).json({ error: `No user with id ${user_id}` })
  }

  const [articleErr, article] = await to(db('article').insert(body).returning('*'))
  if (!R.isNil(articleErr)) {
    logger.error(`${articleErr}`)
    return res.status(500).json({ error: `${articleErr}` })
  }

  if (R.isEmpty(article)) {
    const error = 'No row written'
    logger.error(error)
    return res.status(500).json({ error })
  }

  return res.status(200).json(article[0])
}

const updateArticle = async (req, res) => {
  const { id } = req.params

  // Validate input with Joi schema
  const { error: schemaErr, value: body } = createSchema.validate(req.body)
  if (!R.isNil(schemaErr)) {
    const error = `Error in input (err: ${schemaErr})`
    logger.error(error)
    return res.status(400).json({ error })
  }

  const [articleTestErr, articleTest] = await to(db('article')
    .select()
    .where((builder) =>builder.where('id', '=', `${id}`))
    ,)
  if (!R.isNil(articleTestErr)) {
    logger.error(`${articleTestErr}`)
    return res.status(500).json({ error: `${articleTestErr}` })
  }
  if(articleTest.length == 0){
    return res.status(500).json({ error: `No article id ${id}` })
  }
  if(articleTest[0].users_id != body.users_id){
    return res.status(500).json({ error: `Only the creator can modify article id ${id}` })
  }

  const [articleErr, article] = await to(
    db('article')
      .update({ ...body, updated_at: new Date() })
      .where({ id })
      .returning('*'),
  )
  if (!R.isNil(articleErr)) {
    logger.error(`${articleErr}`)
    return res.status(500).json({ error: `${articleErr}` })
  }

  if (R.isEmpty(article)) {
    const error = `No article for id ${id}`
    logger.error(error)
    return res.status(500).json({ error })
  }

  return res.status(200).json(article[0])
}

const deleteArticle = async (req, res) => {
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

  const [articleErr, article] = await to(
    db('article').del().where({ id }).returning('*'),
  )
  if (!R.isNil(articleErr)) {
    logger.error(`${articleErr}`)
    return res.status(500).json({ error: `${articleErr}` })
  }

  if (R.isEmpty(article)) {
    const error = `No article for id ${id}`
    logger.error(error)
    return res.status(500).json({ error })
  }

  return res.status(200).json(article[0])
}

module.exports = { getAll, getById, createArticle, updateArticle, deleteArticle }
