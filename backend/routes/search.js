const express = require('express')
const { PrismaClient } = require('@prisma/client');
const { fetchListingsFromDB } = require('../services/fetchRelevantListingsService');
const { requireAuth } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateMiddleware')
const { logInfo, logWarning, logError } = require('../services/loggingService');
const { makeSchema } = require('../schemas/makeModelSchema');
const { searchPreferenceSchema } = require('../schemas/searchPreferenceSchema');

const prisma = new PrismaClient()
const search = express.Router()
search.use(requireAuth)

search.get('/makes', async (req, res) => {
  logInfo('Request to get all makes received');
  try {
    const makes = await prisma.make.findMany({
      select: {name: true},
      orderBy: {name: 'asc'}
    }
    );
    logInfo('All makes retrieved successfully')
    res.json(makes);
  } catch (error) {
    logError('An error occured', error);
    res.json(error);
  }
})

search.get('/:make/models', validateRequest({ params: makeSchema }), async (req, res) => {

  const make = req.params.make;

  logInfo(`Request to get all models for Make: ${make} received`);

  try {
    const make = req.params.make;
    const models = await prisma.model.findMany({
      where: { makeName: make },
      select: { name: true },
      orderBy: {name: 'asc'}
    })
    logInfo('All models retrieved successfully')
    res.json(models)
  } catch (error) {
    logError('An error occured', error);
    res.json(error);
  }
})

search.get('/', validateRequest({ query: searchPreferenceSchema }), async (req, res) => {
  const { make, model } = req.query;

  logInfo(`Request to get listings for Make: ${make}, Model: ${model} received`);
  
  const response = await fetchListingsFromDB(req.query);
  
  if (response.status === 200) {
    res.json(response.listings);
  } else if (response.status === 404) {
    res.status(404).json({ message: response.message })
  } else {
    res.status(500).json({ message: response.message })
  }
})

module.exports = search;