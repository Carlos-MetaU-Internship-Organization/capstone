const axios = require('axios')
const { PrismaClient } = require('@prisma/client')
const { logInfo, logError } = require('../../frontend/src/utils/logging.service')
const prisma = new PrismaClient()

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
  } else if (searchesResponse.status === 404) {
    return null;
  } else {
    return searchesResponse.message;
  }

  // Fetch local listings based on user search history
  let searchedListings = []

  const promises = pastSearches.map(search => fetchListingsFromLocal(search));
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

    if (!pastSearches) {
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

async function fetchListingsFromAutoDev(filters) {
  const { make, model, condition, zip, distance, color = '', minYear = '', maxYear = '', maxMileage = '', minPrice = '', maxPrice = '', sortOption = '', page = 1} = filters;

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

  const apiKey = process.env.CAR_API_KEY;
  const headers = {
    Authorization: `Bearer ${apiKey}`
  };
  let reqLink = `https://auto.dev/api/listings?make=${make}&model=${model}&latitude=${latitude}&longitude=${longitude}&radius=${distance}&page=${page}`;
  logInfo(`Making request to: ${reqLink}`)

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
    return ({ status: 200, listings: data });
  } catch (error) { 
    logError('Error during search for Listings', error);
    return ({ status: 500, message: 'Failed to search for listings using Auto Dev API' })
  }
}

async function fetchListingsFromLocal(filters) {
  const { make, model, condition, zip, distance, color = '', minYear = '', maxYear = '', maxMileage = '', minPrice = '', maxPrice = '', sortOption = '', page = 1} = filters;

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
      take: 20
    })

    if (!listings) {
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

module.exports = {
  fetchRecentlyClickedListings,
  fetchPastSearches,
  fetchListingsFromSearchHistory,
  fetchListingsFromAutoDev,
  fetchLocalListingFromVIN
};