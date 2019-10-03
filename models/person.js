'use strict';

const Sequelize = require('sequelize');
const setupDatabase = require('./database');

module.exports = function setupPersonModel(config) {
    const sequelize = setupDatabase(config);
    const person = sequelize.define('person', {
        name: {
            type: Sequelize.STRING(25),
            allowNull: false,
            unique: true,
            validate: {
                is: ["^[a-z]+$", "'", 'i'],
                msg: 'Ingrese su nombre'
            }
        },
        lastName: {
            type: Sequelize.STRING(25),
            allowNull: false,
            unique: true,
            validate: {
                is: ["[a-z]", "'", 'i'], // Permite ingresar solo letras y '
                isAlpha: true,
                msg: 'Ingrese su apellido'
            }
        },
        birthdate: {
            type: Sequelize.DATE,
            allowNull: false,
            validate: {
                isAlphanumeric: true
            }
        },
        document: {
            type: Sequelize.STRING(25),
            allowNull: false,
            unique: true
        },
        documentTypeId: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: 'documentTypes',
                key: 'id'
            }
        },
        genderId: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: 'genders',
                key: 'id'
            }
        },
        nationalityId: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: 'nationalities',
                key: 'id'
            }
        },
        contact: Sequelize.STRING(50),
        contactTypeId: {
            type: Sequelize.STRING,
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