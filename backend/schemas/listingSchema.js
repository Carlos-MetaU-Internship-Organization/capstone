const Joi = require('joi')
const { MIN_YEAR, MIN_VIN_LENGTH, MAX_VIN_LENGTH } = require('../utils/constants')

const listingInfoSchema = Joi.object({
  condition: Joi.string().required(),
  make: Joi.string().required(),
  model: Joi.string().required(),
  year: Joi.number().integer().min(MIN_YEAR).max(new Date().getFullYear()).required(),
  color: Joi.string().required(),
  mileage: Joi.number().integer().default(0).min(0).required(),
  vin: Joi.string().alphanum().min(MIN_VIN_LENGTH).max(MAX_VIN_LENGTH).required(),
  description: Joi.string().empty('').default('N/A').required(),
  images: Joi.array().items(
    Joi.alternatives().try(
      Joi.string().uri(),
      Joi.string().dataUri()
    )
  ).min(1).required(),
  price: Joi.number().min(0).required()
});

const priceEstimateSchema = Joi.object({
  condition: Joi.string().required(),
  make: Joi.string().required(),
  model: Joi.string().required(),
  year: Joi.number().integer().min(MIN_YEAR).max(new Date().getFullYear()).required(),
  mileage: Joi.number().integer().default(0).min(0).required(),
})

const soldStatusSchema = Joi.object({
  new_sold_status: Joi.boolean().required()
})


const vinSchema = Joi.object({
  vin: Joi.string().alphanum().min(MIN_VIN_LENGTH).max(MAX_VIN_LENGTH).required()
})

const listingIdSchema = Joi.object({
  listingId: Joi.number().required()
})

const countSchema = Joi.object({
  count: Joi.number().required()
})

module.exports = {
  listingInfoSchema,
  soldStatusSchema,
  vinSchema,
  listingIdSchema,
  priceEstimateSchema,
  countSchema
}