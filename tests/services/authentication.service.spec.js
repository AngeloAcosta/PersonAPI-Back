'use strict';

const test = require('ava');
const sinon = require('sinon');

const setupAuthenticationService = require('./../../services/authentication.service');

let sandbox = null;
let authenticationService;

test.beforeEach(() => {
  sandbox = sinon.createSandbox();

  authenticationService = setupAuthenticationService();
});

test.afterEach(() => {
  sandbox && sandbox.restore();
});

test.serial('Login: success response', t => {
  const response = authenticationService.login();

  t.true(response.hasOwnProperty('responseCode'), 'Expected responseCode property');
  t.true(response.hasOwnProperty('message'), 'Expected message property');
  t.true(response.hasOwnProperty('data'), 'Expected data property');
});