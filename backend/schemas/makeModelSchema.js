const Joi = require('joi')

const makeSchema = Joi.object({
  make: Joi.string().required()
})

module.exports = { makeSchema }