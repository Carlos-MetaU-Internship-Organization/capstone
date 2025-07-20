const Joi = require('joi')
const { MIN_NAME_LENGTH, MAX_NAME_LENGTH, MIN_USERNAME_LENGTH, MAX_USERNAME_LENGTH, MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } = require('../utils/constants')

const signupSchema = Joi.object({
  name: Joi.string().min(MIN_NAME_LENGTH).max(MAX_NAME_LENGTH).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().custom((value, helpers) => {
    const digits = value.replace(/\D/g, '')

    if (digits.length !== 10) {
      return helpers.message('Phone number must contain exactly 10 digits')
    }

    return digits
  }),
  zip: Joi.string().pattern(/^\d{5}$/).required(),
  username: Joi.string().alphanum().min(MIN_USERNAME_LENGTH).max(MAX_USERNAME_LENGTH).required(),
  password: Joi.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH).required()
})

const loginSchema = Joi.object({
  login: Joi.string().required(),
  password: Joi.string().required()
})

module.exports = { signupSchema, loginSchema }