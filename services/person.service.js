"use strict";

const setupBaseService = require("./base.service");

module.exports = function setupPersonService(model) {
  let baseService = new setupBaseService();

  async function doList() {
    try {
      const people = await model.findAll();

      baseService.returnData.responseCode = 200;
      baseService.returnData.message = "Getting data successfully";
      baseService.returnData.data = people;
    } catch (err) {
      console.log("Error: ", err);
      baseService.returnData.responseCode = 500;
      baseService.returnData.message = "" + err;
      baseService.returnData.data = [];
    }

    return baseService.returnData;
  }

  async function modifyPerson(request) {
    let errors = [];
    try {
      //Check if person exists
      const where = { id: request.params.id };
      const person = await model.findOne({ where });

      if (person) {
        //Proper data validation for each field to modify
        for (let prop in request.body) {
          if (
            request.body[prop] === "" &&
            prop !== "Contact" &&
            prop !== "ContactType"
          ) {
            errors.push(`The field ${prop} is required.`);
          }
        }

        if (!/^[a-zA-ZñÑ'\s]{1,25}$/.test(request.body.name)) {
          errors.push("Some characters in the Name field are not allowed.");
        }

        if (!/[a-zA-ZñÑ'\s]{1,25}/.test(request.body.lastName)) {
          errors.push(
            "Some characters in the Last Name field are not allowed."
          );
        }

        if (!/[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(request.body.birthdate)) {
          errors.push("Invalid Birth Date field format.");
        }

        if (!/^([0-9]){0,1}$/.test(request.body.documentTypeId)) {
          errors.push("Invalid submitted Document Type value.");
        } else {
          switch (request.body.documentTypeId) {
            case "1":
              if (!/^[0-9]{8}$/.test(request.body.document)) {
                errors.push("Invalid submitted DNI format.");
              }
              break;

            case "2":
              if (!/^([a-zA-Z0-9]){12}$/.test(request.body.document)) {
                errors.push("Invalid submitted PASSPORT format.");
              }
              break;

            case "3":
              if (!/^([a-zA-Z0-9]){12}$/.test(request.body.document)) {
                errors.push("Invalid submitted CE format.");
              }
              break;

            default:
              break;
          }
        }

        if (!/^[0-9]{0,1}$/.test(request.body.genderId)) {
          errors.push("Invalid submitted GenderId value.");
        }

        if (!/^[0-9]{0,2}$/.test(request.body.countryId)) {
          errors.push("Invalid submitted CountryId value.");
        }

        if (
          !/^[0-9]{0,1}$/.test(request.body.contactTypeId1) ||
          !/^[0-9]{0,1}$/.test(request.body.contactTypeId2)
        ) {
          errors.push("Contact Type field 1 or 2 are invalid");
        } else {
          //Hardcoded at the moment, need to be changed according to Front End team design

          //Validation to Contact1
          if (request.body.contactTypeId1 == 1) {
            //Telephone
            if (!/^([0-9]){6,9}$/.test(request.body.contact1)) {
              errors.push("Invalid Telephone format.");
            }
          } else if (request.body.contactTypeId1 == 2) {
            //Email
            if (
              !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/.test(
                request.body.contact1
              )
            ) {
              errors.push("Invalid Email format.");
            }
          } else {
            errors.push("ContactTypeId field 1 is invalid."); //When is submitted other values like 3, 4 and so
          }

          //Validation to Contac2
          if (request.body.contactTypeId2 == 1) {
            //Telephone
            if (!/^([0-9]){6,9}$/.test(request.body.contact2)) {
              errors.push("Invalid Telephone format.");
            }
          } else if (request.body.contactTypeId2 == 2) {
            //Email
            if (
              !/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(
                request.body.contact2
              )
            ) {
              errors.push("Invalid Email format.");
            }
          } else {
            errors.push("ContactTypeId field 2 is invalid."); //When is submitted other values like 3, 4 and so
          }
        }

        //Send Validation Errors or Update the data

        if (errors.length) {
          baseService.returnData.responseCode = 400;
          baseService.returnData.message = "Errors from data validation";
          baseService.returnData.data = errors;
        } else {
          const personModified = await model.update(request.body, {
            where
          });

          if (personModified) {
            baseService.returnData.responseCode = 200;
            baseService.returnData.message = "Update completed successfully.";
            baseService.returnData.data = [];
          }
        }
      } else {
        baseService.returnData.responseCode = 400;
        baseService.returnData.message =
          "Person doesn't exist on the database.";
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
    modifyPerson,
    findById
  };
};
