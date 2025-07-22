const express = require('express')
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateMiddleware')
const { logInfo, logError } = require('../services/loggingService');
const { searchFilterSchema } = require('../schemas/searchFilterSchema');
const { getSavedSearchFilters, getViewedSearchFilters, findExistingSearchFilter, createSearchFilter, deleteSearchFilter } = require('../services/searchFilterService');
const { MAX_VIEWED_FILTERS } = require('../utils/constants')

const prisma = new PrismaClient()
const searchFilters = express.Router()
searchFilters.use(requireAuth);

searchFilters.post('/save', validateRequest({ body: searchFilterSchema }), async (req, res) => {
  const userId = req.session.user.id;

  try {
    const existingSearchFilter = await findExistingSearchFilter(userId, req.body, 'saverId');

    if (existingSearchFilter) {
      logInfo('Unsaving search filter')
      const searchFilterToDeleteId = existingSearchFilter.id;
      await deleteSearchFilter(searchFilterToDeleteId);
      return res.json({ inDB: false, searchFilter: existingSearchFilter })
    }
  
    logInfo('Saving search filter')
    const searchFilter = await createSearchFilter(userId, req.body, 'saverId');

    res.json({ inDB: true, searchFilter });
  } catch (error) {
    logError('Error adding to saved search filters:', error);
    res.status(500).json({ message: 'Error adding to saved search filters'})
  }
})

searchFilters.get('/saved', async (req, res) => {
  const userId = req.session.user.id;

  try {
    const savedSearchFilters = await getSavedSearchFilters(userId);
    res.json(savedSearchFilters)
  } catch (error) {
    logError('Error getting saved search filters:', error)
    res.status(500).json({ message: 'Error getting saved search filters' })
  }  
})

searchFilters.post('/view', validateRequest({ body: searchFilterSchema }), async (req, res) => {
  const userId = req.session.user.id;

  try {
    const existingSearchFilter = await findExistingSearchFilter(userId, req.body, 'viewerId');

    if (existingSearchFilter) {
      logInfo('Already viewed. Skipping...')
      return res.status(204).send()
    }
  
    await createSearchFilter(userId, req.body, 'viewerId');

    const viewedSearchFilters = await getViewedSearchFilters(userId);

    if (viewedSearchFilters.length > MAX_VIEWED_FILTERS) {
      const searchFilterToDeleteId = viewedSearchFilters[MAX_VIEWED_FILTERS].id;
      await deleteSearchFilter(searchFilterToDeleteId);
    }

    res.status(204).send();
  } catch (error) {
    logError('Error adding to viewed search filters:', error);
    res.status(500).json({ message: 'Error adding to viewed search filters'})
  }  
})

searchFilters.get('/viewed', async (req, res) => {
  const userId = req.session.user.id;

  try {
    const viewedSearchFilters = await getViewedSearchFilters(userId);
    res.json(viewedSearchFilters)
  } catch (error) {
    logError('Error getting viewed search filters:', error)
    res.status(500).json({ message: 'Error getting viewed search filters' })
  }  
})

module.exports = searchFilters;