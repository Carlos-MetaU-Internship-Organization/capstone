const { faker } = require('@faker-js/faker')

function createRandomUser() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const phoneNumber = (faker.phone.number( { style: 'international' })).slice(2);
  return {
    name: `${firstName} ${lastName}`,
    username: faker.internet.username({ firstName, lastName }),
    phoneNumber: phoneNumber,
    zip: faker.location.zipCode('#####'),
    email: faker.internet.email({ firstName, lastName }),
    password: faker.internet.password()
  }
}

module.exports = createRandomUser