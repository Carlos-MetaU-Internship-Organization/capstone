const Joi = require('joi')

const trackDwellAndClickSchema = Joi.object({
  listingId: Joi.number().integer().required(),
  clickCount: Joi.number().integer().min(0).required(),
  dwellTime: Joi.number().min(0).required()
})

module.exports = { trackDwellAndClickSchema }