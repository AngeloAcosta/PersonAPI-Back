'use strict';

const Sequelize = require('sequelize');
const setupDatabase = require('./database');

module.exports = function setupPersonModel(config) {
  const sequelize = setupDatabase(config);
  const person = sequelize.define('person', {
    name: {
      type: Sequelize.STRING(25),
      allowNull: true,
      validate: {
        is: ["^[A-ZÑa-zñ.s_-]+$"], //Allows only leters
        min: 1
      }
    },
    lastName: {
      type: Sequelize.STRING(25),
      allowNull: true,
      validate: {
        is: ["^[A-ZÑa-zñ'.s_-]+$"], // Allows only leters and '
        min: 2
      }
    },
    birthdate: {
      type: Sequelize.DATEONLY,
      allowNull: true
    },
    documentTypeId: {
      type: Sequelize.INTEGER,
      allowNull: true, //Validation is in person.service
      references: {
        model: 'documentTypes',
        key: 'id'
      }
    },
    document: {
      type: Sequelize.STRING(25),
      allowNull: true,
      unique: true
    },
    genderId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'genders',
        key: 'id' //id is created by default
      }
    },
    countryId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'countries',
        key: 'id'
      }
    },
    contact1: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    contactType1Id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'contactTypes',
        key: 'id'
      }
    },
    contact2: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    contactType2Id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'contactTypes',
        key: 'id'
      }
    },
    isGhost: {
      type: Sequelize.BOOLEAN,
      allowNull: false
    }
  });
  person.belongsTo(sequelize.models.contactType, { as: 'contactType1' });
  person.belongsTo(sequelize.models.contactType, { as: 'contactType2' });
  person.belongsTo(sequelize.models.documentType, { as: 'documentType' });
  person.belongsTo(sequelize.models.gender, { as: 'gender' });
  person.belongsTo(sequelize.models.country, { as: 'country' });
  return person;
};
