const axios = require('axios')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { logInfo, logError } = require('../../frontend/src/utils/logging.service')
const { PAGE_SIZE, SIMILARITY_DEPTHS, MINIMUM_COMPS_REQUIRED } = require('../utils/constants')
const haversineDistanceMiles = require('../utils/geo')
const getDaysOnMarket = require('../utils/time')

async function fetchRecentlyClickedListings(userId, count) {
 try {
    const mostRecentVisits = await prisma.listingVisit.findMany({
      where: { userId },
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

  const promises = pastSearches.map(search => fetchListingsFromDB(search, PAGE_SIZE));
  const results = await Promise.all(promises);
  results.forEach(result => {
    if (result.status === 200) {
      searchedListings.push(...result.listings);
    }
  })

  return searchedListings;
}

async function fetchPastSearches(userId) {
  try {
    const pastSearches = await prisma.searchPreference.findMany({
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

async function fetchListingsFromDB(filters, count = 0) {
  const { make, model, condition, zip, distance, color = '', minYear = '', maxYear = '', maxMileage = '', minPrice = '', maxPrice = '', sortOption = ''} = filters;

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
    return ({ status: 500, message: 'Failed to turn ZIP into latitude & longitude' })
  }

  const whereClause = {
    make,
    model
  }

  if (condition != 'new&used') {
    whereClause.condition = condition;
  }
  if (color != '') {
    whereClause.color = color;
  }
  if (minYear != '') {
    whereClause.year = { gte: minYear };
  }
  if (maxYear != '') {
    if (!whereClause.year) {
      whereClause.year = {};
    }
    whereClause.year.lte = maxYear;
  }
  if (maxMileage != '') {
    whereClause.mileage.lte = maxMileage;
  }
  if (minPrice != '') {
    whereClause.price = { gte: minPrice };
  }
  if (maxPrice != '') {
    if (!whereClause.price) {
      whereClause.price = {};
    }
    whereClause.price.lte = maxPrice;
  }

  const { minLatitude, maxLatitude, minLongitude, maxLongitude } = calculateBounds(parseFloat(latitude), parseFloat(longitude), parseInt(distance));
  whereClause.latitude = { gte: minLatitude, lte: maxLatitude };
  whereClause.longitude = { gte: minLongitude, lte: maxLongitude };
  
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

  const changeInLatitude = radius / milesPerDegreeLatitude;

  const milesPerDegreeLongitude = milesPerDegreeLatitude * Math.cos(latitude * (Math.PI / 180))
  const changeInLongitude = radius / milesPerDegreeLongitude;

  const minLatitude = latitude - changeInLatitude;
  const maxLatitude = latitude + changeInLatitude;
  const minLongitude = longitude - changeInLongitude;
  const maxLongitude = longitude + changeInLongitude;

  return {
    minLatitude,
    maxLatitude,
    minLongitude,
    maxLongitude
  }
}

async function fetchLocalListingFromVIN(vin) {
  try {
    const listing = await prisma.listing.findFirst({
      where: { vin },
      include: {
        favoriters: {
          select: {
            id: true,
            name: true,
            username: true,
            phoneNumber: true,
            zip: true,
            email: true
          }
        },
        owner: {
          select: {
            id: true
          }
        }
      }
    })

    if (!listing) {
      return ({ status: 404, message: `No local listing with VIN: ${vin} found`})
    }

    logInfo(`Successfully retrieved a local listing with a matching VIN`)
    return ({ status: 200, listing })

  } catch (error) {
    logError(`Error during search for local listing with VIN: ${vin}`)
    return ({ status: 500, message: `Failed to search for local listing with VIN: ${vin}`})
  }
}

async function fetchSimilarListings(listingInfo) {
  const { condition, make, model, year, mileage, latitude, longitude } = listingInfo;

  let maxDepthReached = null;
  const comps = new Map();

  for (let depth = 0; depth < SIMILARITY_DEPTHS.length; depth++) {
    const { YEAR_RANGE, MILEAGE_FACTOR } = SIMILARITY_DEPTHS[depth];

    let whereClause = {
      condition,
      make,
      model
    }

    whereClause.year = {
      gte: year - YEAR_RANGE,
      lte: year + YEAR_RANGE
    }

    if (depth < SIMILARITY_DEPTHS.length - 1) {
      whereClause.mileage = {
        gte: Math.floor(mileage * (1 - MILEAGE_FACTOR)),
        lte: Math.ceil(mileage * (1 + MILEAGE_FACTOR))
      }
    }

    try {
      const similarListings = await prisma.listing.findMany({
        where: whereClause
      });
  
      if (Array.isArray(similarListings)) {
        similarListings.forEach(listing => {
          if (!comps.has(listing.id)) {
            listing.depth = depth + 1;
            listing.distanceFromSeller = haversineDistanceMiles(latitude, longitude, listing.latitude, listing.longitude);
            listing.daysOnMarket = getDaysOnMarket(listing);
            comps.set(listing.id, listing);
          }
        })

        if (similarListings.length >= MINIMUM_COMPS_REQUIRED) {
          maxDepthReached = depth + 1;
          break;
        }
      }
    } catch (error) {
      logError('Something bad happened trying to retrieve similar listings', error);
      return ({ status: 500, message: 'Failed to retrieve similar listings' })
    }
  }
  const numberOfListingsFound = comps.size;
  if (numberOfListingsFound !== 0) {
    logInfo(`Successfully retrieved ${numberOfListingsFound} similar listings`);
    return ({ status: 200, depth: maxDepthReached ?? SIMILARITY_DEPTHS.length, listings: [...comps.values()] })
  }
  logInfo('No similar listings were found')
  return ({ status: 404, message: 'No similar listings were found' })
}

module.exports = {
  fetchRecentlyClickedListings,
  fetchPastSearches,
  fetchListingsFromSearchHistory,
  fetchListingsFromDB,
  fetchLocalListingFromVIN,
  fetchSimilarListings
};