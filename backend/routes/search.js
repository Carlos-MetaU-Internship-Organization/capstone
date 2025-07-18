const { logInfo, logWarning, logError } = require('../utils/logging.service');
const axios = require('axios')
const express = require('express')
const search = express.Router()
const { PrismaClient } = require('@prisma/client');
const { fetchListingsFromDB } = require('../services/fetchRelevantListingsService');
const prisma = new PrismaClient()

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

search.get('/:make/models', async (req, res) => {
  // TODO: input validation
  const make = req.params.make;

  if (!make) {
    logWarning('No make provided');
    return res.status(400).json({ message: 'Invalid make'});
  }

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

search.get('/', async (req, res) => {
  const { make, model, condition, zip, distance, color = '', minYear = '', maxYear = '', maxMileage = '', minPrice = '', maxPrice = '', sortOption = ''} = req.query;

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