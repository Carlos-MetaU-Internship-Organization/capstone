const { faker } = require('@faker-js/faker')
const zipcodes = require('zipcodes')

function createRandomUser() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const phoneNumber = (faker.phone.number( { style: 'international' })).slice(2);
  const zip = getRandomUSZip();
  return {
    name: `${firstName} ${lastName}`,
    username: faker.internet.username({ firstName, lastName }),
    phoneNumber,
    zip,
    email: faker.internet.email({ firstName, lastName }),
    password: faker.internet.password()
  }
}

function getRandomUSZip() {
  let ZipAndCountry;

  do {
    const randomZip = zipcodes.random();
    ZipAndCountry = { zip: randomZip.zip, country: randomZip.country };
  } while (ZipAndCountry.country !== 'US')

  return ZipAndCountry.zip;
}

module.exports = createRandomUser