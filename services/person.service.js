"use strict";

const setupBaseService = require("./base.service");

const Op = Sequelize.Op;

module.exports = function setupPersonService(models) {
  const contactTypeModel = models.contactTypeModel;
  const countryModel = models.countryModel;
  const documentTypeModel = models.documentTypeModel;
  const genderModel = models.genderModel;
  const personModel = models.personModel;
  let baseService = new setupBaseService();
  const personModel = dbInstance.personModel;
  const documentTypeModel = dbInstance.documentTypeModel;

  //#region Helpers
  function getDoListModel(people) {
    return people.map(person => {
      let contactType1 = null;
      if (person.contactType1) {
        contactType1 = person.contactType1.name;
      }
      let contactType2 = null;
      if (person.contactType2) {
        contactType2 = person.contactType2.name;
      }
      return {
        id: person.id,
        name: person.name,
        lastName: person.lastName,
        birthdate: person.birthdate,
        documentType: person.documentType.name,
        document: person.document,
        gender: person.gender.name,
        contactType1,
        contact1: person.contact1,
        contactType2,
        contact2: person.contact2
      };
    });
  }

  function getOrderField(orderBy) {
    let qOrderBy;
    switch (orderBy) {
      case 1:
        qOrderBy = "name";
        break;
      case 2:
        qOrderBy = "lastName";
        break;
      case 3:
        qOrderBy = "birthdate";
        break;
      case 4:
        qOrderBy = "document";
        break;
      case 5:
        qOrderBy = "genderId";
        break;
      case 6:
        qOrderBy = "countryId";
        break;
      default:
        qOrderBy = "name";
        break;
    }
    return qOrderBy;
  }

  function getOrderType(orderType) {
    let qOrderType;
    switch (orderType) {
      case 1:
        qOrderType = "ASC";
        break;
      case 2:
        qOrderType = "DESC";
        break;
      default:
        qOrderType = "ASC";
        break;
    }
    return qOrderType;
  }
  //#endregion

  async function doList(requestQuery) {
    try {
      let qOrderBy = getOrderField(requestQuery.orderBy);
      let qOrderType = getOrderType(requestQuery.orderType);
      let qQuery = `%${requestQuery.query}%`;
      // Execute the query
      const people = await personModel.findAll({
        include: [
          { as: "documentType", model: documentTypeModel },
          { as: "gender", model: genderModel },
          { as: "country", model: countryModel },
          { as: "contactType1", model: contactTypeModel },
          { as: "contactType2", model: contactTypeModel }
        ],
        limit: requestQuery.limit,
        offset: requestQuery.offset,
        order: [[qOrderBy, qOrderType]],
        where: {
          [Op.or]: [
            { name: { [Op.like]: qQuery } },
            { lastName: { [Op.like]: qQuery } },
            { document: { [Op.like]: qQuery } },
            { contact1: { [Op.like]: qQuery } },
            { contact2: { [Op.like]: qQuery } }
          ]
        }
      });
      // Mold the response
      const peopleData = getDoListModel(people);
      // Return the data
      baseService.returnData.responseCode = 200;
      baseService.returnData.message = "Getting data successfully";
      baseService.returnData.data = peopleData;
    } catch (err) {
      console.log("Error: ", err);
      baseService.returnData.responseCode = 500;
      baseService.returnData.message = "" + err;
      baseService.returnData.data = [];
    }

    return baseService.returnData;
  }

  function checkBlankSpacesforUpdate(data) {
    let errors = [];
    for (let prop in data) {
      if (data[prop] === "" && prop !== "Contact" && prop !== "ContactType") {
        errors.push(`The field ${prop} is required.`);
      }
    }
    return errors;
  }

  function checkNameFormatUpdate(data) {
    let errors = [];
    if (!/^[a-zA-ZñÑ'\s]{1,25}$/.test(data.name)) {
      errors.push("Some characters in the Name field are not allowed.");
    }

    if (!/[a-zA-ZñÑ'\s]{1,25}/.test(data.lastName)) {
      errors.push("Some characters in the Last Name field are not allowed.");
    }
    return errors;
  }

  function checkDocumentUpdate(data) {
    let errors = [];
    if (!/^([0-9]){0,1}$/.test(data.documentTypeId)) {
      errors.push("Invalid submitted Document Type value.");
    } else {
      switch (data.documentTypeId) {
        case "1":
          if (!/^[0-9]{8}$/.test(data.document)) {
            errors.push("Invalid submitted DNI format.");
          }
          break;

        case "2":
          if (!/^([a-zA-Z0-9]){12}$/.test(data.document)) {
            errors.push("Invalid submitted PASSPORT format.");
          }
          break;

        case "3":
          if (!/^([a-zA-Z0-9]){12}$/.test(data.document)) {
            errors.push("Invalid submitted CE format.");
          }
          break;

        default:
          break;
      }
    }
    return errors;
  }

  function checkBirthDataUpdate(data) {
    let errors = [];

    if (!/[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(data.birthdate)) {
      errors.push("Invalid Birth Date field format.");
    }

    if (!/^[0-9]{0,1}$/.test(data.genderId)) {
      errors.push("Invalid submitted GenderId value.");
    }

    if (!/^[0-9]{0,2}$/.test(data.countryId)) {
      errors.push("Invalid submitted CountryId value.");
    }
    return errors;
  }

  function checkContactDataUpdate(dataTypeField, contactValue) {
    let errors = [];
    // TODO: Technical Debt | Move validations into a service and create constants
    if (!/^[0-9]{0,1}$/.test(dataTypeField)) {
      errors.push("Contact Type field is invalid.");
    } else {
      //Validation to Contact1
      if (dataTypeField == 1) {
        //Telephone
        if (!/^([0-9]){6,9}$/.test(contactValue)) {
          errors.push("Invalid Telephone format.");
        }
      } else if (dataTypeField == 2) {
        //Email
        if (
          !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/.test(
            contactValue
          )
        ) {
          errors.push("Invalid Email format.");
        }
      } else {
        errors.push("Contact Type field is invalid."); //When is submitted other values like 3, 4 and so
      }
    }

    return errors;
  }

  async function modifyPerson(request) {
    let errors = [];
    try {
      //Check if person exists
      const where = { id: request.params.id };
      const person = await personModel.findOne({ where });

      if (person) {
        //Proper data validation for each field to modify

        errors.concat(checkBlankSpacesforUpdate(request.body));

        errors.concat(checkNameFormatUpdate(request.body));

        errors.concat(checkDocumentUpdate(request.body));

        errors.concat(checkBirthDataUpdate(request.body));

        errors.concat(
          checkContactDataUpdate(
            request.body.contactTypeId1,
            request.body.contact1
          )
        );

        errors.concat(
          checkContactDataUpdate(
            request.body.contactTypeId2,
            request.body.contact2
          )
        );

        //Send Validation Errors or Update the data

        if (errors.length) {
          baseService.returnData.responseCode = 400;
          baseService.returnData.message = "Errors from data validation";
          baseService.returnData.data = errors;
        } else {
          const personModified = await personModel.update(request.body, {
            where
          });

          baseService.returnData.responseCode = 200;
          baseService.returnData.message = "Update completed successfully.";
          baseService.returnData.data = personModified;
        }
      } else {
        baseService.returnData.responseCode = 400;
        baseService.returnData.message = "Person doesnt exist on the database.";
        baseService.returnData.data = errors;
      }
    } catch (err) {
      console.log("Error: ", err);
      baseService.returnData.responseCode = 500;
      baseService.returnData.message = "" + err;
      baseService.returnData.data = [];
    }

    return baseService.returnData;
  }

  async function create(request) {
    try {
      const documentTypes = documentTypeModel.findOne({
        where: { id: request.body.DocumentTypes }
      });
      const document = request.body.DocumentID;

      //Validations for DocumentType
      if (documentTypes) {
        // document type exists
        if (documentTypes.name === "DNI" && document.length != 8) {
          //DNI
          throw new Error("DNI invalid");
        } else if (documentTypes.name === "Passport" && document.length != 12) {
          // Passport
          throw new Error("Passport invalid");
        } else if (
          documentTypes.name === "Foreign Card" &&
          document.length != 12
        ) {
          //Foreign Card
          throw new Error("Foreign Card invalid");
        }
      } else {
        // document type NO exists
        throw new Error("Type of document invalid");
      }

      const newUser = {
        name: request.body.Name,
        lastName: request.body.LastName,
        birthdate: request.body.DateOfBirth, //Format: YYYY-MM-DD
        documentTypeId: request.body.DocumentType,
        document: request.body.DocumentID,
        genderId: request.body.Gender,
        countryId: request.body.Country,
        contact1: request.body.contact1,
        contactTypeId1: request.body.contactTypeId1,
        contact2: request.body.contact2,
        contactTypeId2: request.body.contactTypeId2
      };

      let created = await personModel.create(newUser); //Create user
      if (created) {
        console.log("The person was registered");
        baseService.returnData.responseCode = 200;
        baseService.returnData.message = "Data was registered satisfactory";
      }
      return baseService.returnData;
    } catch (err) {
      console.log("The person wasn´t registered");
      baseService.returnData.responseCode = 400; //Validation error
      baseService.returnData.message = "Data wasn´t registered satisfactory";
    }
  }

  async function findById(id) {
    try {
      const person = await model.findOne({
        where: {
          id
        }
      });

      baseService.returnData.responseCode = 200;
      baseService.returnData.message = "Getting data successfully";
      baseService.returnData.data = person;
    } catch (err) {
      console.log("Error: ", err);
      baseService.returnData.responseCode = 500;
      baseService.returnData.message = "" + err;
      baseService.returnData.data = [];
    }

    return baseService.returnData;
  }

  return {
    doList,
    create,
    modifyPerson,
    findById
  };
};
