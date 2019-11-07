const constants = require('./../services/constants');
const faker = require('faker');

//#region Helpers
function getContactTypes() {
  return [
    constants.emailContactType,
    constants.phoneContactType
  ];
}

function getCountries() {
  return [
    constants.argentinaCountry,
    constants.brazilCountry,
    constants.chileCountry,
    constants.colombiaCountry,
    constants.ecuadorCountry,
    constants.guyanaCountry,
    constants.paraguayCountry,
    constants.peruCountry,
    constants.surinamCountry,
    constants.uruguayCountry,
    constants.venezuelaCountry,
  ];
}

function getDocumentTypes() {
  return [
    constants.dniDocumentType,
    constants.foreignCardDocumentType,
    constants.passportDocumentType
  ]
}

function getGenders() {
  return [
    constants.maleGender,
    constants.femaleGender
  ];
}
//#endregion

async function seedContactTypes(model) {
  await model.bulkCreate(getContactTypes());
}

async function seedCountries(model) {
  await model.bulkCreate(getCountries());
}

async function seedDocumentTypes(model) {
  await model.bulkCreate(getDocumentTypes());
}

async function seedGenders(model) {
  await model.bulkCreate(getGenders());
}

async function seedPeople(model) {
  const people = [];
  for (let index = 0; index < 50; index++) {
    const documentTypeId = faker.random.arrayElement(getDocumentTypes()).id;
    let document = '';
    if (documentTypeId === constants.dniDocumentType.id) {
      document = faker.random.number({ min: 10000000, max: 99999999 });;
    } else {
      document = faker.random.alphaNumeric(12).toUpperCase();
    }
    const contactType1Id = faker.random.arrayElement(getContactTypes()).id;
    const contactType2Id = faker.random.arrayElement(getContactTypes()).id;
    let contact1 = '';
    let contact2 = '';
    if (contactType1Id == constants.phoneContactType.id) {
      contact1 = faker.random.number({ min: 100000, max: 999999999 });
    } else {
      contact1 = faker.internet.email();
    }
    if (contactType2Id == constants.phoneContactType.id) {
      contact2 = faker.random.number({ min: 100000, max: 999999999 });
    } else {
      contact2 = faker.internet.email();
    }
    people.push({
      name: faker.name.firstName(),
      lastName: faker.name.lastName(),
      birthdate: faker.date.past(),
      document,
      documentTypeId,
      genderId: ((index % 2 === 0) ? 1 : 2),
      countryId: faker.random.arrayElement(getCountries()).id,
      contact1,
      contactType1Id,
      contact2,
      contactType2Id,
      isGhost: false,
      isDeleted: false,
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
      relativeId: 12,
      kinshipType: constants.coupleKinshipType.id
    },
    {
      personId: 12,
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
