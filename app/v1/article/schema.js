const Joi = require('joi')

const createSchema = Joi.object({
  title: Joi.string()
    .pattern(/^[0-z\s]+$/)
    .trim()
    .min(1)
    .required(),
  
  users_id: Joi.number()
    .integer()
    .required(),
})

const deleteSchema = Joi.object({
  users_id: Joi.number()
    .integer()
    .required(),
})

module.exports = { createSchema, deleteSchema }
