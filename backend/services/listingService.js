const axios = require('axios')
const { PrismaClient } = require('@prisma/client')
const zipcodes = require('zipcodes')
const gps = require('gps2zip')
const levenshtein = require('js-levenshtein');
const { logInfo, logError, logWarning } = require('../services/loggingService');
const { calculateBounds } = require('../utils/geo')
const { PAGE_SIZE, MIN_LISTINGS_TO_FETCH, RATIO_OF_TOTAL_LISTINGS_TO_FETCH } = require('../utils/constants')

const prisma = new PrismaClient()

async function fetchListingsForMigration(makeModelCombinationBatch) {

  const allListings = [];

  for (const makeModelCombination of makeModelCombinationBatch) {
    const make = makeModelCombination.makeName;
    const model = makeModelCombination.name;

    const page1 = await fetchPage(make, model, 1);
    const cleanedPage1Listings = cleanResultsFromAPI(page1.listings);
    allListings.push(...cleanedPage1Listings)
    
    const numberOfListings = page1.numberOfListings;

    if (numberOfListings > PAGE_SIZE) {
      const howManyToFetch = Math.max(MIN_LISTINGS_TO_FETCH, Math.ceil(numberOfListings * RATIO_OF_TOTAL_LISTINGS_TO_FETCH));
  
      const pagesToFetch = [];
      for (let page = 2; page <= Math.ceil(howManyToFetch / PAGE_SIZE); page++) {
        pagesToFetch.push(page);
      }
  
      const results = await Promise.all(
        pagesToFetch.map(page => fetchPage(make, model, page))
      )
  
      results.forEach(pageResult => {
        const cleanedPageResults = cleanResultsFromAPI(pageResult.listings)
        allListings.push(...cleanedPageResults)
      });
    }
  }

  const status = allListings.length > 0 ? 200 : 500;
  logInfo(`Successfully retrieved ${allListings.length} listings using Auto Dev API`)
  return { status, listings: allListings };
}

function cleanResultsFromAPI(listings) {

  return listings.map(listing => ({
    vin: listing.vin,
      condition: listing.condition,
      make: listing.make,
      model: listing.model,
      year: listing.year,
      color: getClosestColor(listing.displayColor),
      mileage: listing.mileageUnformatted,
      description: 'N/A', // no description acquired from API
      images: listing.photoUrls,
      price: listing.priceUnformatted,
      zip: gps.gps2zip(listing.lat, listing.lon).zip_code,
      latitude: listing.lat,
      longitude: listing.lon,
      city: listing.city,
      state: listing.state,
      createdAt: listing.createdAt
  }))
}

function getClosestColor(inputColor) {
  if (!inputColor) return "";

  const colors = ['beige', 'black', 'blue', 'brown', 'gold', 'gray', 'green', 'orange', 'purple', 'red', 'silver', 'white', 'yellow'];
  
  let closestColor = null;
  let minDistance = Infinity;
  colors.forEach(color => {
    const distance = levenshtein(inputColor.toLowerCase(), color);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = color;
    }
  })

  return closestColor;
}

async function fetchMakeModelCombinations() {
  try {
    const makeModelCombinations = await prisma.model.findMany({
      select: {
        makeName: true,
        name: true
      }
    })
    logInfo('Successfully retrieved all make & model combinations')
    return { status: 200, makeModelCombinations }
  } catch (error) {
    logError('Error trying to retrieve all make & model combinations')
    return { status: 500 }
  }
}

async function fetchPage(make, model, page) {
  const url = `https://auto.dev/api/listings?make=${make}&model=${model}&page=${page}&exclude_no_price=true`;

  try {
    const response = await axios.get(url)

    if (response.status !== 200) {
      logWarning('Auto Dev API retrived status ${response.status}')
      return { listings: [], numberOfListings: 0 }
    }

    logInfo(`Successfully fetched ${response.data.hitsCount} listings for Make: ${make} Model: ${model}. There are ${response.data.totalCount} total.`)
    return { listings: response.data.records, numberOfListings: response.data.totalCount }
  } catch (error) {
    logError('Error during listing retrieval using Auto Dev API', error)
    return { listings: [], numberOfListings: 0 }
  }
}

async function getFavoritedListings(userId) {
  return prisma.user.findFirst({
    where: { id: userId },
    select: { favoritedListings: true }
  })
}

async function getPopularListings() {
  return prisma.listing.findMany({
    orderBy: {
      visits: {
        _count: 'desc'
      }
    },
    take: 20
  });
}

async function getRecentlyVisitedListings(userId, count) {
  return prisma.listingVisit.findMany({
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
}

async function getMostDwelledListings(userId, count) {
  return prisma.listingVisit.findMany({
    where: { userId },
    orderBy: { dwellTime: 'desc' },
    take: count,
    include: { listing: true }
  })
}

async function getOwnedListings(userId) {
  return prisma.listing.findMany({
    where: { ownerId: userId },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          username: true,
          phoneNumber: true,
          zip: true,
          email: true
        }
      }
    },
    orderBy: [
      { sold: 'asc'},
      { createdAt: 'desc' }
    ]
  })
}

async function getListingFromVIN(vin) {
  return prisma.listing.findFirst({
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
}

async function updateFavoriteCount(vin, operation) {
  return prisma.listing.update({
    where: { vin },
    data: {
      favorites: {
        [operation]: 1
      }
    },
    select: { favorites: true }
  })
}

async function updateUserFavoritedList(vin, userId, operation) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      favoritedListings: {
        [operation]: { vin }
      }
    },
    select: { favoritedListings: true }
  })
}

async function deleteListing(listingId) {
  return prisma.listing.delete({
    where: { id: listingId }
  })
}

async function sellListing(listingId, newSoldStatus) {
  return prisma.listing.update({
    where: { id: listingId },
    data: {
      sold: newSoldStatus
    }
  })
}

async function createListing(listingInfo, userInfo) {
  return prisma.listing.create({
    data: {
      ...listingInfo,
      ...userInfo
    }
  })
}

async function getListings(searchFilter, count = 0, userId = -1) {
  const searchWhereClause = createSearchWhereClause(searchFilter, userId);

  return prisma.listing.findMany({
    where: searchWhereClause,
    ...(count && { take: count })
  })
}

// Helper function for `getListings()`
function createSearchWhereClause(searchFilter, userId) {
  const { make, model, condition, distance, zip, color, minYear, maxYear, maxMileage, minPrice, maxPrice } = searchFilter;
  
  const { latitude, longitude } = zipcodes.lookup(zip);

  const searchWhereClause = {
    make,
    model,
    sold: false
  }

  if (condition != 'new&used') {
    searchWhereClause.condition = condition;
  }

  if (color) {
    searchWhereClause.color = color;
  }

  if (minYear || maxYear) {
    searchWhereClause.year = {};
    if (minYear) searchWhereClause.year.gte = parseInt(minYear);
    if (maxYear) searchWhereClause.year.lte = parseInt(maxYear);
  }

  if (maxMileage) {
    searchWhereClause.mileage = { lte: parseInt(maxMileage) };
  }

  if (minPrice || maxPrice) {
    searchWhereClause.price = {};
    if (minPrice) searchWhereClause.price.gte = parseInt(minPrice);
    if (maxPrice) searchWhereClause.price.lte = parseInt(maxPrice);
  }

  const { minLatitude, maxLatitude, minLongitude, maxLongitude } = calculateBounds(latitude, longitude, parseInt(distance));
  searchWhereClause.latitude = { gte: minLatitude, lte: maxLatitude };
  searchWhereClause.longitude = { gte: minLongitude, lte: maxLongitude };

  // exclude own listings
  if (userId !== -1) {
    searchWhereClause.ownerId = { not: userId }
  }

  return searchWhereClause
}

module.exports = {
  fetchListingsForMigration,
  fetchMakeModelCombinations,
  createListing,
  getFavoritedListings,
  getPopularListings,
  getRecentlyVisitedListings,
  getMostDwelledListings,
  getOwnedListings,
  getListingFromVIN,
  updateFavoriteCount,
  updateUserFavoritedList,
  deleteListing,
  sellListing,
  createListing,
  getListings
}