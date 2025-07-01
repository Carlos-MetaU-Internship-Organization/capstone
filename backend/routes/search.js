const { logInfo, logWarning, logError } = require('../utils/logging.service');
const axios = require('axios')

const express = require('express')
const search = express.Router()
const { PrismaClient } = require('@prisma/client')
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
  logInfo(`Request to get all models for Make: ${make} received`);
  try {
    const make = req.params.make;
    const models = await prisma.model.findMany({
      where: { makeName: make },
      select: { name: true },
      orderBy: {name: 'asc'}
    })
    //TODO: if invalid make (models.length <= 0), then log and return bad
    logInfo('All models retrieved successfully')
    res.json(models)
  } catch (error) {
    logError('An error occured', error);
    res.json(error);
  }
})

search.get('/:make/:model/:condition/:zip/:distance/:page', async (req, res) => {
  // TODO: input validation
  const { make, model, condition, zip, distance, page } = req.params;
  logInfo(`Request to get listings for Make: ${make}, Model: ${model}, Page: ${page} received`);
  let latitude = null;
  let longitude = null;
  
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${zip}&format=json&limit=1`, { headers: { 'User-Agent': 'CarPortal' } });
    const data = response.data;
    latitude = data[0].lat;
    longitude = data[0].lon;
    logInfo(`Turned ZIP: ${zip} into Latitude: ${latitude}, Longitude: ${longitude}`);
  } catch (error) {
    logError('Could not turn ZIP into latitude & longitude', error);
  }
  
  const apiKey = process.env.CAR_API_KEY;
  const headers = {
    Authorization: `Bearer ${apiKey}`
  };
  let reqLink = `https://auto.dev/api/listings?make=${make}&model=${model}&latitude=${latitude}&longitude=${longitude}&radius=${distance}&page=${page}`;
  if (condition != 'new&used') {
    reqLink += `&condition[]=${condition}`;
  }
  try {
    const response = await axios.get(reqLink, headers);
    const data = response.data;
    logInfo(`Successfully retrieved ${data.hitsCount} listings`)
    res.json(data);
  } catch (error) {
    logError('Error during Search for Listings', error);
    res.json(error);
  }
})

search.get('/', async (req, res) => {
  const { make, model, condition, zip, distance, color, minYear, maxYear, maxMileage, minPrice, maxPrice, sortOption, page } = req.query;

  logInfo(`Request to get listings for Make: ${make}, Model: ${model}, Page: ${page} received`);
  let latitude = null;
  let longitude = null;
  
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${zip}&format=json&limit=1`, { headers: { 'User-Agent': 'CarPortal' } });
    const data = response.data;
    latitude = data[0].lat;
    longitude = data[0].lon;
    logInfo(`Turned ZIP: ${zip} into Latitude: ${latitude}, Longitude: ${longitude}`);
  } catch (error) {
    logError('Could not turn ZIP into latitude & longitude', error);
  }

  const apiKey = process.env.CAR_API_KEY;
  const headers = {
    Authorization: `Bearer ${apiKey}`
  };
  let reqLink = `https://auto.dev/api/listings?make=${make}&model=${model}&latitude=${latitude}&longitude=${longitude}&radius=${distance}&page=${page}`;

  if (condition != 'new&used') {
    reqLink += `&condition[]=${condition}`;
  }
  if (color != '') {
    reqLink += `&exterior_color[]=${color}`;
  }
  if (minYear != '') {
    reqLink += `&year_min=${minYear}`;
  }
  if (maxYear != '') {
    reqLink += `&year_max=${maxYear}`;
  }
  if (maxMileage != '') {
    reqLink += `&mileage=${maxMileage}`;
  }
  if (minPrice != '') {
    reqLink += `&price_min=${minPrice}`;
  }
  if (maxPrice != '') {
    reqLink += `&price_max=${maxPrice}`;
  }
  if (sortOption != '') {
    reqLink += `&sort_filter=${sortOption}`
  }

  try {
    const response = await axios.get(reqLink, headers);
    const data = response.data;
    logInfo(`Successfully retrieved ${data.hitsCount} listings`)
    res.json(data);
  } catch (error) {
    logError('Error during Search for Listings', error);
    res.json(error);
  }
})

module.exports = search;