const { logError } = require('../services/loggingService')

const validateRequest = ({ body, params, query }) => (req, res, next) => {
  const validationOptions = {
    convert: true,
    stripUnknown: true
  }

  if (body) {
    const { error, value } = body.validate(req.body, validationOptions);
    if (error) {
      logError(error.details[0].message)
      return res.status(400).json({ error: error.details[0].message })
    }
    req.body = value;
  }

  if (params) {
    const { error, value } = params.validate(req.params, validationOptions);
    if (error) {
      logError(error.details[0].message)
      return res.status(400).json({ error: error.details[0].message })
    }
    req.params = value;
  }

  if (query) {
    const { error, value } = query.validate(req.query, validationOptions);
    if (error) {
      logError(error.details[0].message)
      return res.status(400).json({ error: error.details[0].message })
    }
    req.query = value;
  }

  next();
}

module.exports = { validateRequest }