const constants = require('./../services/constants');
const faker = require('faker');

async function seedContactTypes(model) {
  await model.bulkCreate([
    {
      name: 'Phone',
      createdAt: faker.date.past(),
      updatedAt: new Date()
    },
    {
      name: 'Email',
      createdAt: faker.date.past(),
      updatedAt: new Date()
    }
  ]);
}

async function seedCountries(model) {
  await model.bulkCreate([
    {
      name: 'Peru',
      createdAt: faker.date.past(),
      updatedAt: new Date()
    },
    {
      name: 'Ecuador',
      createdAt: faker.date.past(),
      updatedAt: new Date()
    },
    {
      name: 'Colombia',
      createdAt: faker.date.past(),
      updatedAt: new Date()
    },
    {
      name: 'Venezuela',
      createdAt: faker.date.past(),
      updatedAt: new Date()
    },
    {
      name: 'Guyana',
      createdAt: faker.date.past(),
      updatedAt: new Date()
    },
    {
      name: 'Surinam',
      createdAt: faker.date.past(),
      updatedAt: new Date()
    },
    {
      name: 'Brazil',
      createdAt: faker.date.past(),
      updatedAt: new Date()
    },
    {
      name: 'Paraguay',
      createdAt: faker.date.past(),
      updatedAt: new Date()
    },
    {
      name: 'Uruguay',
      createdAt: faker.date.past(),
      updatedAt: new Date()
    },
    {
      name: 'Argentina',
      createdAt: faker.date.past(),
      updatedAt: new Date()
    },
    {
      name: 'Chile',
      createdAt: faker.date.past(),
      updatedAt: new Date()
    }
  ]);
}

async function seedDocumentTypes(model) {
  await model.bulkCreate([
    {
      name: 'DNI',
      createdAt: faker.date.past(),
      updatedAt: new Date()
    },
    {
      name: 'Passport',
      createdAt: faker.date.past(),
      updatedAt: new Date()
    },
    {
      name: 'Foreign card',
      createdAt: faker.date.past(),
      updatedAt: new Date()
    }
  ]);
}

async function seedGenders(model) {
  await model.bulkCreate([
    {
      name: 'Male',
      createdAt: faker.date.past(),
      updatedAt: new Date()
    },
    {
      name: 'Female',
      createdAt: faker.date.past(),
      updatedAt: new Date()
    }
  ]);
}

async function seedPeople(model) {
  let countryIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  let documentTypeIds = [1, 2, 3];
  let contactTypeIds = [1, 2];
  let people = [];
  for (let index = 0; index < 50; index++) {
    let contactType1Id = faker.random.arrayElement(contactTypeIds);
    let contactType2Id = faker.random.arrayElement(contactTypeIds);
    let contact1 = '';
    let contact2 = '';
    if (contactType1Id == 1) {
      contact1 = faker.phone.phoneNumber();
    } else {
      contact1 = faker.internet.email();
    }
    if (contactType2Id == 1) {
      contact2 = faker.phone.phoneNumber();
    } else {
      contact2 = faker.internet.email();
    }
    people.push({
      name: faker.name.firstName(),
      lastName: faker.name.lastName(),
      birthdate: faker.date.past(),
      document: faker.random.alphaNumeric(8).toUpperCase(),
      documentTypeId: faker.random.arrayElement(documentTypeIds),
      genderId: ((index % 2 === 0) ? 1 : 2),
      countryId: faker.random.arrayElement(countryIds),
      contact1,
      contactType1Id,
      contact2,
      contactType2Id,
      isGhost: false,
      createdAt: faker.date.past(),
      updatedAt: new Date()
    });
  }
  await model.bulkCreate(people);
}

async function seedKinships(model) {
  await model.bulkCreate([
    {
      personId: 1,
      relativeId: 3,
      kinshipType: constants.fatherKinshipType.id
    },
    {
      personId: 1,
      relativeId: 2,
      kinshipType: constants.motherKinshipType.id
    },
    {
      personId: 9,
      relativeId: 3,
      kinshipType: constants.fatherKinshipType.id
    },
    {
      personId: 9,
      relativeId: 2,
      kinshipType: constants.motherKinshipType.id
    },
    {
      personId: 11,
      relativeId: 3,
      kinshipType: constants.fatherKinshipType.id
    },
    {
      personId: 11,
      relativeId: 2,
      kinshipType: constants.motherKinshipType.id
    },
    {
      personId: 8,
      relativeId: 3,
      kinshipType: constants.fatherKinshipType.id
    },
    {
      personId: 8,
      relativeId: 2,
      kinshipType: constants.motherKinshipType.id
    },
    {
      personId: 10,
      relativeId: 3,
      kinshipType: constants.fatherKinshipType.id
    },
    {
      personId: 10,
      relativeId: 2,
      kinshipType: constants.motherKinshipType.id
    },
    {
      personId: 3,
      relativeId: 5,
      kinshipType: constants.fatherKinshipType.id
    },
    {
      personId: 3,
      relativeId: 4,
      kinshipType: constants.motherKinshipType.id
    },
    {
      personId: 2,
      relativeId: 7,
      kinshipType: constants.fatherKinshipType.id
    },
    {
      personId: 2,
      relativeId: 6,
      kinshipType: constants.motherKinshipType.id
    },
    {
      personId: 1,
      relativeId: 3,
      kinshipType: constants.fatherKinshipType.id
    },
    {
      personId: 1,
      relativeId: 13,
      kinshipType: constants.coupleKinshipType.id
    },
    {
      personId: 13,
      relativeId: 1,
      kinshipType: constants.coupleKinshipType.id
    }
  ]);
}

module.exports = {
  seedContactTypes,
  seedCountries,
  seedDocumentTypes,
  seedGenders,
  seedKinships,
  seedPeople
};
