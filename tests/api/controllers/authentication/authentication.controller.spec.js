'use strict';

const test = require('ava');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { mockRequest, mockResponse } = require('mock-req-res');

let sandbox = null;

test.beforeEach(() => {
  sandbox = sinon.createSandbox();
});

test.afterEach(() => {
  sandbox && sandbox.restore();
});

function getController() {
  return proxyquire('./../../../../api/controllers/authentication/authentication.controller', {
    './../../../services/service.container': () => {
      return {
        login: () => {
          return {
            responseCode: 200,
            status: true,
            message: '',
            data: {}
          };
        }
      };
    }
  });
}

test.serial('Login: Check parameters', async t => {
  const request = mockRequest({});
  const response = mockResponse({});

  const controller = getController();

  await controller.login(request, response);

  t.true(response.status.called, 'Expected status being called');
  t.true(response.status.calledWith(400), 'Expected status called with success response');
  t.true(response.json.called, 'Expected json being called');
});

test.serial('Login: Success response', async t => {
  const request = mockRequest({
    body: {
      email: 'test@email.com',
      password: 'password'
    }
  });
  const response = mockResponse({});

  const controller = getController();

  await controller.login(request, response);

  t.true(response.status.called, 'Expected status being called');
  t.true(response.status.calledWith(200), 'Expected status called with success response');
  t.true(response.json.called, 'Expected json being called');
});