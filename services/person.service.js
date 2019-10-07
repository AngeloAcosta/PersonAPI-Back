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
            errors.push(`The field ${request.body[prop]} is required.`);
          }
        }

        if (!/^[a-zA-ZñÑ'\s]{1,25}$/.test(request.body.Name)) {
          errors.push("Some characters in the Name field are not allowed.");
        }

        if (!/[a-zA-ZñÑ'\s]{1,25}/.test(request.body.LastName)) {
          errors.push("Some characters in the LastName field are not allowed.");
        }

        if (!/[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(request.body.DateOfBirth)) {
          errors.push("Birth Date format is not allowed.");
        }

        if (
          request.body.documentType === "" ||
          request.body.documentType !== "DNI" ||
          request.body.documentType !== "CE" ||
          request.body.documentType !== "PASSPORT"
        ) {
          errors.push("Invalid Submitted Document Type value.");
        } else {
          switch (request.body.documentType) {
            case "DNI":
              if (!/^[0-9]{8}$/.test(request.body.DocumentID)) {
                errors.push("Invalid submitted DNI format.");
              }
              break;

            case "CE":
              if (!/^([a-zA-Z0-9]){12}$/.test(request.body.DocumentID)) {
                errors.push("Invalid submitted CE format.");
              }
              break;

            case "PASSPORT":
              if (!/^([a-zA-Z0-9]){12}$/.test(request.body.DocumentID)) {
                errors.push("Invalid submitted PASSPORT format.");
              }
              break;

            default:
              break;
          }
        }

        if (
          request.body.Gender !== "Male" ||
          request.body.Gender !== "Female"
        ) {
          errors.push("Invalid submitted Gender value.");
        }

        if (!/^[a-zA-ZñÑ'\s]$/.test(request.body.Country)) {
          errors.push("Some characters in the Country field are not allowed.");
        }

        for (let key in request.body.Contact) {
          //If there is more than 1 type of contact for each person
          if (
            request.body.Contact[key].ContactType !== "Telephone" &&
            request.body.Contact[key].ContactType !== "Email"
          ) {
            errors.push("Invalid Contact Type value.");
          } else {
            if (request.body.Contact[key].ContactType === "Telephone") {
              if (
                !/^([2-9])(\d{2})(-?|\040?)(\d{4})( ?|\040?)(\d{1,4}?|\040?)$/.test(
                  request.body.Contact[key].Contact
                )
              ) {
                errors.push("Invalid Telephone format.");
              }
            } else {
              if (
                !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/.test(
                  request.body.Contact[key].Contact
                )
              ) {
                errors.push("Invalid Email format.");
              }
            }
          }
        }

        // Using only the person data for update until Contact details are decided.
        const { userData, Contact } = request.body;
        //Send Validation Errors or Update the data

        if (errors.length) {
          baseService.returnData.responseCode = 400;
          baseService.returnData.message = "Errors from data validation";
          baseService.returnData.data = errors;
        } else {
          const personModified = await model.update(userData, {
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

  return {
    doList,
    modifyPerson
  };
};
