const express = require('express')
const { PrismaClient } = require('@prisma/client');
const { fetchRecentlyClickedListings } = require('../services/fetchRelevantListingsService');
const { requireAuth } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateMiddleware')
const { logInfo, logWarning, logError } = require('../services/loggingService');
const { trackDwellAndClickSchema } = require('../schemas/trackSchema')


const prisma = new PrismaClient()
const track = express.Router()
track.use(requireAuth)

track.post('/dwell-and-click', validateRequest({ body: trackDwellAndClickSchema}), async (req, res) => {
  let { listingId, clickCount, dwellTime } = req.body;
  const userId = req.session.user.id;

  try {
    const prev_visit = await prisma.listingVisit.findFirst({
      where: { userId, listingId }
    })

    if (prev_visit) {
      await prisma.listingVisit.update({
        where: { id: prev_visit.id },
        data: {
          clickCount: prev_visit.clickCount + clickCount,
          dwellTime: prev_visit.dwellTime + dwellTime,
          recentVisitAt: new Date()
        }
      })
    } else {
      await prisma.listingVisit.create({
        data: { userId, listingId, clickCount, dwellTime }
      })
    }

    logInfo(`Successfully tracked ${dwellTime} seconds of dwell time & ${clickCount} clicks for listingId: ${listingId} and userId: ${userId}`)
    res.json({ message: 'Successfully tracked dwell time & click count.'})
  } catch (error) {
    logError('Something bad happened when trying to save dwell time & click count', error);
    res.status(500).json({ message: 'Failed to save dwell time & click count'})
  }  
})

track.get('/most-dwelled-listings', async (req, res) => {
  const userId = req.session.user.id;

  try {
    const topVisits = await prisma.listingVisit.findMany({
      where: { userId },
      orderBy: { dwellTime: 'desc' },
      take: 10,
      include: { listing: true }
    })

    if (!topVisits) {
      return res.status(400).json({ message: `User with Id: ${userId} has no previous visits` });
    }

    res.json(topVisits);
  } catch (error) {
    logError('Something bad happened trying to fetch most-dwelled listings', error);
    res.status(500).json({ message: 'Failed to retrieve 10 listings with highest dwell time'})
  }
})

track.get('/most-recently-visited-listings/:count', async (req, res) => {
  const userId = req.session.user.id;
  const count = parseInt(req.params.count);

  const response = await fetchRecentlyClickedListings(userId, count);

  if (response.status === 200) {
    res.json(response.listings);
  } else if (response.status === 404) {
    res.status(404).json({ message: `User with Id: ${userId} has no previous visits`})
  } else {
    res.status(500).json({ message: `Failed to retrieve the ${count} most-recently visited listings` })
  }
})

module.exports = track;