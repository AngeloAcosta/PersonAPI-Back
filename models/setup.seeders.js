const faker = require('faker');

async function seedContactTypes(model) {
  await model.bulkCreate([
    {
      name: 'Teléfono',
      createdAt: faker.date.past(),
      updatedAt: new Date()
    },
    {
      name: 'Correo electrónico',
      createdAt: faker.date.past(),
      updatedAt: new Date()
    }
  ]);
}

async function seedCountries(model) {
  await model.bulkCreate([
    {
      name: 'Perú',
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
      name: 'Pasaporte',
      createdAt: faker.date.past(),
      updatedAt: new Date()
    },
    {
      name: 'Carnet de extranjeria',
      createdAt: faker.date.past(),
      updatedAt: new Date()
    }
  ]);
}

async function seedGenders(model) {
  await model.bulkCreate([
    {
      name: 'Masculino',
      createdAt: faker.date.past(),
      updatedAt: new Date()
    },
    {
      name: 'Femenino',
      createdAt: faker.date.past(),
      updatedAt: new Date()
    }
  ]);
}

async function seedPeople(model) {
  let countryIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  let documentTypeIds = [1, 2, 3];
  let genderIds = [1, 2];
  let contactTypeIds = [1, 2];
  let people = [];
  for (let index = 0; index < 25; index++) {
    let genderId = faker.random.arrayElement(genderIds);
    let gender = '';
    if (genderId == 1) {
      gender = 'male';
    } else {
      gender = 'female';
    }
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
      name: faker.name.firstName(gender),
      lastName: faker.name.lastName(),
      birthdate: faker.date.past(),
      document: faker.random.alphaNumeric(8).toUpperCase(),
      documentTypeId: faker.random.arrayElement(documentTypeIds),
      genderId,
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

module.exports = {
  seedContactTypes,
  seedCountries,
  seedDocumentTypes,
  seedGenders,
  seedPeople
};
