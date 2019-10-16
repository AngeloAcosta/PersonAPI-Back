"use strict";

const Sequelize = require("sequelize");
const setupBaseService = require("./base.service");
const Op = Sequelize.Op;

module.exports = function setupKinshipService(models) {
  const personModel = models.personModel;
  const kinshipModel = models.kinshipModel;
  const validationService = models.validationService;
  let baseService = new setupBaseService();

  async function create(kinshipData) {
    try {
      // let dbService = await setupDBService();
      const personId = kinshipData.personId;
      const relativeId = kinshipData.relativeId;
      const kinshipType = kinshipData.kinshipType;
      const validationResult = await validationService.validateKinshipCreation(
        personId,
        relativeId,
        kinshipType
      );

      if (validationResult) {
        await kinshipModel.create(kinshipData);
        baseService.returnData.responseCode = 200;
        baseService.returnData.message = "Getting data successfully";
        baseService.returnData.data = {};
      } else {
        baseService.returnData.responseCode = 400;
        baseService.returnData.message = "Error adding kinship";
        baseService.returnData.data = {};
      }
    } catch (err) {
      console.log("Error: ", err);
      baseService.returnData.responseCode = 500;
      baseService.returnData.message = "" + err;
      baseService.returnData.data = [];
    }
    baseService.returnData.responseCode = 200;
    baseService.returnData.message = "Getting data successfully";
    baseService.returnData.data = {};

    return baseService.returnData;
  }

  function getOrderField(orderBy) {
    let qOrderBy;
    switch (orderBy) {
      case 1:
        qOrderBy = ["person", "name"];
        break;
      case 2:
        qOrderBy = ["person", "document"];
        break;
      case 3:
        qOrderBy = ["relative", "name"];
        break;
      case 4:
        qOrderBy = ["relative", "document"];
        break;
      default:
        qOrderBy = ["person", "name"];
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

  function getDoListModel(kinships) {
    return kinships.map(kinship => {
      const person = {
        name: '',
        lastName: '',
        document: ''
      };
      const relative = {
        name: '',
        lastName: '',
        document: ''
      };
      const kinshipType = '';

      return {
        person,
        relative,
        kinshipType
      }
    });
  }

  async function doList(requestQuery) {
    try {
      let qOrderBy = getOrderField(requestQuery.orderBy);
      let qOrderType = getOrderType(requestQuery.orderType);
      const qQueryWhereClause = { [Op.like]: `%${requestQuery.query}%` };

      const kinships = await kinshipModel.findAll({
        include: [
          {
            as: "person",
            model: personModel
          },
          {
            as: "relative",
            model: personModel
          }
        ],
        limit: requestQuery.limit,
        offset: requestQuery.offset,
        where: {
          [Op.or]: [
            { '$person.name$': qQueryWhereClause },
            { '$person.lastName$': qQueryWhereClause },
            { '$person.document$': qQueryWhereClause },
            { '$relative.name$': qQueryWhereClause },
            { '$relative.lastName$': qQueryWhereClause },
            { '$relative.document$': qQueryWhereClause }
          ]
        },
        order: [[...qOrderBy, qOrderType]]
      });
      // Mold the response
      kinships = getDoListModel(kinships);

      baseService.returnData.responseCode = 200;
      baseService.returnData.message = "Getting data successfully";
      baseService.returnData.data = kinships;
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
      console.log(id);

      const kinship = await kinshipModel.findOne({
        where: {
          id
        }
      });

      baseService.returnData.responseCode = 200;
      baseService.returnData.message = "Getting data successfully";
      baseService.returnData.data = kinship;
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
    findById,
    create
  };
};
