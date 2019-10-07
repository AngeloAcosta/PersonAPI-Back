'use strict';

const Sequelize = require('sequelize');
const setupDatabase = require('./database');

module.exports = function setupPersonModel(config) {
  const sequelize = setupDatabase(config);
  const person = sequelize.define('person', {
    name: {
      type: Sequelize.STRING(25),
      allowNull: false,
      validate: {
        is: ["^[A-Za-z.\s_-]+$"],
        min: 1
      }
    },
    lastName: {
      type: Sequelize.STRING(25),
      allowNull: false,
      validate: {
        is: ["^[A-Za-z.\s_-]+$"],
        isAlpha: true,
        min: 2
      }
    },
    birthdate: {
      type: Sequelize.DATEONLY,
      allowNull: false,
      validate: {
        isDate: true
      }
    },
    documentTypeId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'documentTypes',
        key: 'id'
      }
    },
    document: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true
    },
    genderId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'genders',
        key: 'id'
      }
    },
    countryId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'countries',
        key: 'id'
      }
    },
    contact1: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    contactTypeId1: {
      type: Sequelize.INTEGER,
      references: {
        model: 'contactTypes',
        key: 'id'
      }
    },
    contact2: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    contactTypeId2: {
      type: Sequelize.INTEGER,
      references: {
        model: 'contactTypes',
        key: 'id'
      }
    }
  });
  person.associate = function (models) {
    person.belongsTo(models.contactType, { as: 'contactType' });
    person.belongsTo(models.documentType, { as: 'documentType' });
    person.belongsTo(models.gender, { as: 'gender' });
    person.belongsTo(models.country, { as: 'country' });
  }
  return person;
};