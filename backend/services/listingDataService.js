const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { logInfo, logError } = require('../../frontend/src/services/loggingService')

async function getGlobalMessagesCount(listingId, ownerId) {
  try {
    const messages = await prisma.message.findMany({
      where: {
        listingId,
        NOT: {
          senderId: ownerId
        }
      }
    });

    if (!messages) {
      logInfo(`No messages were found for listing with listingId: ${listingId}`)
      return ({ status: 404, messageCount: 0 })
    }
    
    logInfo(`Successfully counted ${messages.length} messages for listing with listingId: ${listingId}`);
    return ({ status: 200, messageCount: messages.length })
  } catch (error) {
    logError(`Something bad happened trying to retrieve the global message count on listing with listingId: ${listingId}`, error);
    return ({ status: 500, messageCount: 0 })
  }
}

async function getGlobalViewCount(listingId) {
  try {
    const listingVisits = await prisma.listingVisit.findMany({
      where: { listingId }
    })

    if (!listingVisits) {
      logInfo(`Listing with listingId: ${listingId} has no previous views`)
      return ({ status: 404, viewCount: 0 })
    }

    logInfo(`Listing with listingId: ${listingId} has ${listingVisits.length} views`)
    return ({ status: 200, viewCount: listingVisits.length })
  } catch (error) {
    logError(`Something bad happened trying to retrieve the number of views of listing with listingId: ${listingId}`, error);
    return ({ status: 500, viewCount: 0 })
  }
}

function getGlobalFavoriteCount(listing) {
  return listing.favorites;
}

async function hasUserMessagedSeller(listingId, userId) {
  try {

    const hasMessaged = await prisma.message.findFirst({
      where: {
        listingId,
        senderId: userId
      }
    });

    if (!hasMessaged) {
      logInfo(`User with userId: ${userId} has not messaged seller on listing with listingId: ${listingId}`)
      return ({ status: 404, hasMessaged: false })
    }
    
    logInfo(`Successfully found that user with userId: ${userId} has messaged seller on listing with listingId: ${listingId}`);
    return ({ status: 200, hasMessaged: true })
  } catch (error) {
    logError(`Something bad happened trying to find out if user with userId: ${userId} has messaged seller on listing with listingId: ${listingId}`, error);
    return ({ status: 500, hasMessaged: false })
  }
}

async function hasUserFavoritedListing(listingId, userId) {
  try {
    const favoriters = await prisma.listing.findFirst({
      where: {
        id: listingId
      },
      select: {
        favoriters: {
          select: {
            id: true
          }
        }
      }
    });

    if (!(favoriters.favoriters.map(item => item.id).includes(userId))) {
      logInfo(`User with userId: ${userId} has not favorited listing with listingId: ${listingId}`)
      return ({ status: 404, hasFavorited: false })
    }
    
    logInfo(`Successfully found that user with userId: ${userId} has favorited listing with listingId: ${listingId}`);
    return ({ status: 200, hasFavorited: true })
  } catch (error) {
    logError(`Something bad happened trying to find out if user with userId: ${userId} has favorited listing with listingId: ${listingId}`, error);
    return ({ status: 500, hasFavorited: false })
  }
}

async function getUserDwellTime(listingId, userId) {
  try {
    const dwellTime = await prisma.listingVisit.findFirst({
      where: {
        listingId,
        userId
      },
      select: {
        dwellTime: true
      }
    });

    if (!dwellTime) {
      logInfo(`User with userId: ${userId} has not visited listing with listingId: ${listingId}`)
      return ({ status: 404, dwellTime: 0 })
    }
    
    logInfo(`Successfully found that user with userId: ${userId} has spent ${dwellTime.dwellTime} seconds per day on listing with listingId: ${listingId}`);
    return ({ status: 200, dwellTime: dwellTime.dwellTime })
  } catch (error) {
    logError(`Something bad happened trying to find out how much time user with userId: ${userId} has spent on listing with listingId: ${listingId}`, error);
    return ({ status: 500, dwellTime: 0 })
  }
}

async function getUserClickCount(listingId, userId) {
  try {
    const clickCount = await prisma.listingVisit.findFirst({
      where: {
        listingId,
        userId
      },
      select: {
        clickCount: true
      }
    });

    if (!clickCount) {
      logInfo(`User with userId: ${userId} has not visited listing with listingId: ${listingId}`)
      return ({ status: 404, clickCount: 0 })
    }
    
    logInfo(`Successfully found that user with userId: ${userId} has clicked ${clickCount.clickCount} times per day on listing with listingId: ${listingId}`);
    return ({ status: 200, clickCount: clickCount.clickCount })
  } catch (error) {
    logError(`Something bad happened trying to find out how many clicks user with userId: ${userId} has done on listing with listingId: ${listingId}`, error);
    return ({ status: 500, clickCount: 0 })
  }
}

module.exports = {
  getGlobalMessagesCount,
  getGlobalViewCount,
  getGlobalFavoriteCount,
  hasUserMessagedSeller,
  hasUserFavoritedListing,
  getUserDwellTime,
  getUserClickCount,
};