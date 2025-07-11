const path = require('path')
const createRandomUser = require('../utils/fakeUserGenerator')
const { fetchListingsForMigration, createListing } = require('./listingService')
const { signupUser, getAllNeededUserInfo } = require('./userService')
const { logInfo } = require('./../utils/logging.service')
const { logError } = require('../../frontend/src/utils/logging.service')
const { writeFile } = require('fs').promises

async function populateDBWithUsers() {
  const users = [];
  for (let i = 0; i < 100; i++) {
    const randomUserInfo = createRandomUser();
    const newUser = (await signupUser(randomUserInfo)).newUser;
    if (newUser) {
      users.push(newUser);
    }
  }
  logInfo(`Successfully created ${users.length} users`)
  const filePath = path.join(__dirname, './../data/users.json')
  await writeToFile(filePath, JSON.stringify(users, null, 2));
}

async function populateDBWithListings() {

  const allNeededUserInfoResponse = await getAllNeededUserInfo();
  if (allNeededUserInfoResponse.status !== 200) {
    return false;
  }
  
  const listingsResponse = await fetchListingsForMigration();
  if (listingsResponse.status !== 200) {
    return false;
  }

  const listings = listingsResponse.listings;
  const allUserInfo = allNeededUserInfoResponse.allNeededUserInfo;

  for (const listing of listings) {
    const randomUserIndex = Math.floor(Math.random() * (allUserInfo.length));
    const soldStatus = Math.random() <= .3;
    await createListing(allUserInfo[randomUserIndex], listing, soldStatus)
  }

  logInfo(`Successfully created ${listings.length} listings in the database`);

  return true;
}

async function writeToFile(filename, content) {
  try {
    await writeFile(filename, content);
    logInfo(`Successfully wrote content to ${filename}`)
  } catch (error) {
    logError(`Error writing content to file ${filename}`, error)
  }
}

module.exports = { populateDBWithUsers, populateDBWithListings };