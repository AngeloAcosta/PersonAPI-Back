'use strict';

class baseService {
  constructor() {
    this.returnData = {
      status: false,
      data: {},
      message: '',
      responseCode: 200
    };
  }
}

module.exports = baseService;
