const Joi = require('joi')

const searchPreferenceSchema = Joi.object({
  condition: Joi.string().required(),
  make: Joi.string().required(),
  model: Joi.string().required(),
  distance: Joi.number().integer().min(0).required(),
  zip: Joi.string().pattern(/^\d{5}$/).required(),
  color: Joi.string().empty('').optional(),
  minYear: Joi.number().empty('').optional().min(0),
  maxYear: Joi.number().empty('').optional().min(0),
  maxMileage: Joi.number().empty('').optional().min(0),
  minPrice: Joi.number().empty('').optional().min(0),
  maxPrice: Joi.number().empty('').optional().min(0)
})

module.exports = { searchPreferenceSchema }