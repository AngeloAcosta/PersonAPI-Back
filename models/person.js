"use strict";

const Sequelize = require("sequelize");
const setupDatabase = require("./database");

module.exports = function setupPersonModel(config) {
  const sequelize = setupDatabase(config);
  const person = sequelize.define("person", {
    name: {
      type: Sequelize.STRING(25),
      allowNull: false,
      validate: {
        is: ["^[A-ZÑa-zñ.s_-]+$"], //Allows only leters
        min: 1
      }
    },
    lastName: {
      type: Sequelize.STRING(25),
      allowNull: false,
      validate: {
        is: ["^[A-ZÑa-zñ'.s_-]+$"], // Allows only leters and '
        isAlpha: true,
        min: 2
      }
    },
    birthdate: {
      type: Sequelize.DATEONLY,
      allowNull: false
    },
    documentTypeId: {
      type: Sequelize.INTEGER,
      allowNull: false, //Validation is in person.service
      references: {
        model: "documentTypes",
        key: "id"
      }
    },
    document: {
      type: Sequelize.STRING(25),
      allowNull: false,
      unique: true
    },
    genderId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "genders",
        key: "id" //id is created by default
      }
    },
    countryId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "countries",
        key: "id"
      }
    },
    contact1: {
      //Phone
      type: Sequelize.STRING(50),
      allowNull: true,
      validate: {
        is: ["^[0-9]+$"] //Allows only numbers
      }
    },
    contactTypeId1: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "contactTypes",
        key: "id"
      }
    },
    contact2: {
      //Email
      type: Sequelize.STRING(50),
      allowNull: true,
      validate: {
        is: ["^[a-zñA-ZÑ@.]+$"] //Allows characters for email
      }
    },
    contactTypeId2: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "contactTypes",
        key: "id"
      }
    }
  });

  person.associate = function(models) {
    person.belongsTo(models.documentType, { as: "documentType" });
    person.belongsTo(models.gender, { as: "gender" });
    person.belongsTo(models.country, { as: "country" });
    person.belongsTo(models.contactType, { as: "contactType1" });
    person.belongsTo(models.contactType, { as: "contactType2" });
  };

  return person;
};
