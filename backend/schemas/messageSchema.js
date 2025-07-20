const Joi = require('joi')

const createMessageSchema = Joi.object({
  receiverId: Joi.number().integer().required(),
  content: Joi.string().min(1).required(),
  listingId: Joi.number().integer().required()
})

const getMessagesSchema = Joi.object({
  listingId: Joi.number().integer().required(),
  sellerId: Joi.number().integer().required()
})

module.exports = { createMessageSchema, getMessagesSchema }