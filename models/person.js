'use strict';

const Sequelize = require('sequelize');
const setupDatabase = require('./database');

module.exports = function setupPersonModel(config) {
    const sequelize = setupDatabase(config);
    const person = sequelize.define('person', {
        id: {
            type: Sequelize.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING(25),
            allowNull: false,
            unique: true,
            validate: {
                is: ["^[A-ZÑa-zñ'.\s_-]+$"], //Allows only leters
                min: 1
            }
        },
        lastName: {
            type: Sequelize.STRING(25),
            allowNull: false,
            unique: true,
            validate: {
                is: ["^[A-ZÑa-zñ'.\s_-]+$"], // Allows only leters and '
                isAlpha: true,
                min: 2
            }
        },
        birthdate: {
            type: Sequelize.DATE,
            allowNull: false,
            validate: {
                isAlpha: true //Receive string from CreatePerson form
            }
        },
        documentTypeId: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            references: {
                model: 'documentTypes',
                key:'id'
            }
        },
        document: {
            type: Sequelize.STRING(25),
            allowNull: false,
            unique: true    
        },
        genderId: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            references: {
                model: 'genders',
                key:'id'
            }
        },
        nationalityId: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            references:{
                model: 'nationalities',
                key: 'id'
            }
        },
        contact: {
            type: Sequelize.STRING(50),
            allowNull: true
        },
        contactTypeId: {
            type: Sequelize.INTEGER(11),
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
        person.belongsTo(models.nationality, { as: 'nationality' });
    }
    return person;
};