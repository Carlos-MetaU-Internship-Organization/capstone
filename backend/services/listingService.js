const axios = require('axios')
const gps = require('gps2zip')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { logInfo, logError, logWarning } = require('../../frontend/src/services/loggingService');
const levenshtein = require('js-levenshtein');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');
const { PAGE_SIZE, MIN_LISTINGS_TO_FETCH, RATIO_OF_TOTAL_LISTINGS_TO_FETCH } = require('../utils/constants')

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

async function createListing(userInfo, listingInfo, soldStatus) {
  logInfo(`Request to add a listing for User: ${userInfo.id} received`);

  // TODO: add email

  const listing = {
    vin: listingInfo.vin,
    condition: listingInfo.condition,
    make: listingInfo.make,
    model: listingInfo.model,
    year: parseInt(listingInfo.year) || null,
    color: listingInfo.color,
    mileage: listingInfo.condition !== 'new' ? (parseInt(listingInfo.mileage) || null) : 0,
    description: listingInfo.description,
    images: listingInfo.images || 'https://shnack.com/images/no_photo.jpg',
    price: parseInt(listingInfo.price) || null,
    zip: listingInfo.zip.toString(),
    latitude: listingInfo.latitude,
    longitude: listingInfo.longitude,
    city: listingInfo.city,
    state: listingInfo.state,
    createdAt: listingInfo.createdAt,
    soldAt: soldStatus ? new Date() : null,
    owner_name: userInfo.name,
    owner_number: userInfo.phoneNumber,
    ownerId: userInfo.id,
    sold: soldStatus
  }
  
  for (const key in listing) {
    if (key !== 'soldAt' && (listing[key] === null || listing[key] === undefined || listing[key] === '')) {
      logError(`Missing fields. ${key} is missing.`);
      return { status: 422, message: `Missing fields. ${key} is missing.` }
    }
  }

  try {
    const createdListing = await prisma.listing.create({
      data: listing
    })
    
    logInfo('Listing created successfully')
    return { status: 200, listing: createdListing }
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      logError('Duplicate VIN detected');
      return { status: 400, message: 'VIN already exists' }
    }
    logError('An error occured', error);
    return { status: 500 }
  }
}

module.exports = { fetchListingsForMigration, fetchMakeModelCombinations, createListing }