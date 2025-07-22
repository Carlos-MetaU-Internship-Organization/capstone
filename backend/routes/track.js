const express = require('express')
const { PrismaClient } = require('@prisma/client');
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

module.exports = track;