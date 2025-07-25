const zipcodes = require('zipcodes')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { logInfo, logError } = require('../../frontend/src/services/loggingService')
const { PAGE_SIZE, SIMILARITY_DEPTHS, MINIMUM_COMPS_REQUIRED, MAX_COMPETITORS } = require('../utils/constants')
const { getProximity } = require('../utils/geo')
const getDaysOnMarket = require('../utils/time')
const { getModels, getCompetitors } = require('./makeModelService')
const { rebuildCompetitorGraph } = require('../scripts/rebuildCompetitorGraph')

async function fetchRecentlyClickedListings(userId, count) {
 try {
    const mostRecentVisits = await prisma.listingVisit.findMany({
      where: {
        userId,
        listing: {
          sold: false,
          ownerId: {
            not: userId
          }
        }
      },
      orderBy: { recentVisitAt: 'desc' },
      take: count,
      select: { listing: true }
    })

    if (!mostRecentVisits) {
      logInfo(`No recently visited listings were found for user with Id: ${userId}`)
      return ({ status: 404, message: `User with Id: ${userId} has never visited a listing` })
    }
    
    const mostRecentListings = mostRecentVisits.map(visit => visit.listing);
    logInfo(`Successfully retrieved the ${mostRecentListings.length} most recently visited listings`);
    return ({ status: 200, listings: mostRecentListings})
  } catch (error) {
    logError('Something bad happened trying to retrieve the most recently visited listings', error);
    return ({ status: 500, message: `Failed to retrieve the ${count} most recently visited listings` })
  }
}

async function fetchListingsFromSearchHistory(userId) {
  const searchesResponse = await fetchPastSearches(userId);
  let pastSearches = null;

  if (searchesResponse.status === 200) {
    pastSearches = searchesResponse.searches;
  } else {
    return searchesResponse.message;
  }

  // Fetch local listings based on user search history
  let searchedListings = []

  const promises = pastSearches.map(search => fetchListingsFromDB(search, PAGE_SIZE, userId));
  const results = (await Promise.all(promises)).filter(result => result.status === 200 && result.listings);

  searchedListings.push(...results.flatMap(result => result.listings))

  return searchedListings;
}

async function fetchPastSearches(userId) {
  try {
    const pastSearches = await prisma.searchFilter.findMany({
      where: { viewerId: userId },
    })

    if (pastSearches.length === 0) {
      logInfo(`No past searches were found for user with Id: ${userId}`)
      return ({ status: 404, message: `User with Id: ${userId} has no previous searches` })
    }

    logInfo(`Successfully retrieved the ${pastSearches.length} most recent searches`);
    return ({ status: 200, searches: pastSearches })
  } catch (error) {
    logError('Something bad happened when trying to retrieve the most recent searches', error);
    return ({ status: 500, message: 'Failed to retrieve the most recent searches'})
  }  
}

async function fetchListingsFromDB(filters, count = 0, userId = -1) {
  const { make, model, condition, distance, zip, color, minYear, maxYear, maxMileage, minPrice, maxPrice } = filters;

  const { latitude, longitude } = zipcodes.lookup(zip);

  const whereClause = {
    make,
    model,
    sold: false
  }

  if (condition != 'new&used') {
    whereClause.condition = condition;
  }

  if (color) {
    whereClause.color = color;
  }

  if (minYear || maxYear) {
    whereClause.year = {};
    if (minYear) whereClause.year.gte = parseInt(minYear);
    if (maxYear) whereClause.year.lte = parseInt(maxYear);
  }

  if (maxMileage) {
    whereClause.mileage = { lte: parseInt(maxMileage) };
  }

  if (minPrice || maxPrice) {
    whereClause.price = {};
    if (minPrice) whereClause.price.gte = parseInt(minPrice);
    if (maxPrice) whereClause.price.lte = parseInt(maxPrice);
  }

  const { minLatitude, maxLatitude, minLongitude, maxLongitude } = calculateBounds(latitude, longitude, parseInt(distance));
  whereClause.latitude = { gte: minLatitude, lte: maxLatitude };
  whereClause.longitude = { gte: minLongitude, lte: maxLongitude };

  // exclude own listings
  if (userId !== -1) {
    whereClause.ownerId = { not: userId }
  }
  
  try {
    const listings = await prisma.listing.findMany({
      where: whereClause,
      ...(count && { take: count })
    })

    if (listings.length === 0) {
      logInfo(`No listings were found that matched this search`)
      return ({ status: 404, message: `No listings were found that matched this search` })
    }

    logInfo(`Successfully retrieved ${listings.length} listings`)
    return ({ status: 200, listings });
  } catch (error) { 
    logError('Error during search for Listings', error);
    return ({ status: 500, message: 'Failed to search for listings from local DB' })
  }
}

function calculateBounds(latitude, longitude, radius) {
  const milesPerDegreeLatitude = 69;

  const deltaLatitde = radius / milesPerDegreeLatitude;

  const milesPerDegreeLongitude = milesPerDegreeLatitude * Math.cos(latitude * (Math.PI / 180))
  const deltaLongitude = radius / milesPerDegreeLongitude;

  const minLatitude = latitude - deltaLatitde;
  const maxLatitude = latitude + deltaLatitde;
  const minLongitude = longitude - deltaLongitude;
  const maxLongitude = longitude + deltaLongitude;

  return {
    minLatitude,
    maxLatitude,
    minLongitude,
    maxLongitude
  }
}

async function fetchSimilarListings(listingInfo) {
  await rebuildCompetitorGraph(); // TODO: precompute (maybe run script daily)
  const { condition, make, model, year, mileage, latitude, longitude } = listingInfo;

  const comps = new Map()
  const globalDepth = { depth: 1 };

  const scopeSameModel = [{ make, model }]

  const sameMakeModels = (await getModels(make)).filter(otherModel => otherModel !== model);
  const scopeSameMake = sameMakeModels.map(model => ({ make, model: model.name }))
  
  const scopeCompetitors = (await getCompetitors(make, model, MAX_COMPETITORS)).map(competitor => ({ make: competitor.competitorMake, model: competitor.competitorModel }))

  const scopes = [scopeSameModel, scopeSameMake, scopeCompetitors]

  for (const scope of scopes) {
    for (const { YEAR_RANGE, MILEAGE_FACTOR } of SIMILARITY_DEPTHS) {

      let whereClause = {
        condition,
        OR: scope,
        year: {
          gte: year - YEAR_RANGE,
          lte: year + YEAR_RANGE
        }
      }

      if (MILEAGE_FACTOR > 0) {
        whereClause.mileage = {
          gte: Math.floor(mileage * (1 - MILEAGE_FACTOR)),
          lte: Math.ceil(mileage * (1 + MILEAGE_FACTOR))
        }
      }

      const similarListings = await prisma.listing.findMany({
        where: whereClause
      })

      similarListings.forEach(listing => {
        if (!comps.has(listing.id)) {
          logInfo(`Found a similar listing: ${listing.year} ${listing.make} ${listing.model} with ${listing.mileage}mi priced at ${listing.price} at depth ${globalDepth.depth}`)
          listing.depth = toDepthBucket(globalDepth.depth);
          listing.proximity = getProximity(listing.latitude, listing.longitude, latitude, longitude);
          listing.daysOnMarket = getDaysOnMarket(listing);
          comps.set(listing.id, listing);
        }
      })

      if (comps.size >= MINIMUM_COMPS_REQUIRED) {
        return Array.from(comps.values())
      }

      globalDepth.depth += 1
    }
  }
  return Array.from(comps.values())
}

function toDepthBucket(depth) {
  return depth > 10 ? 7 : depth > 5 ? 6 : depth;
}

module.exports = {
  fetchRecentlyClickedListings,
  fetchPastSearches,
  fetchListingsFromSearchHistory,
  fetchListingsFromDB,
  fetchSimilarListings
};