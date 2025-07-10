const createRandomUser = require('../utils/fakeUserGenerator')
const signupUser = require('./userCreationService')
const { logInfo } = require('./../utils/logging.service');
const { logError } = require('../../frontend/src/utils/logging.service');
const { writeFile } = require('fs').promises;
const path = require('path')

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

async function writeToFile(filename, content) {
  try {
    await writeFile(filename, content);
    logInfo(`Successfully wrote content to ${filename}`)
  } catch (error) {
    logError(`Error writing content to file ${filename}`, error)
  }
}

module.exports = { populateDBWithUsers };