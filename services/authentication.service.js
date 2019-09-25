'use strict';

const setupBaseService = require('./base.service');

module.exports = function setupAuthenticationService(clientAdminInstance, adminInstance) {

  const clientAuth = clientAdminInstance;
  const adminAuth = adminInstance;
  let baseService = new setupBaseService();

  function getSpecificErrorMessage(errorCode) {
    let message = '';
    switch (errorCode) {
      case 'auth/wrong-password':
        message += 'Incorrect password';
        break;
      case 'auth/invalid-email':
        message += 'Invalid email';
        break;
      case 'auth/user-disabled':
        message += 'User is disabled';
        break;
      default:
        message += 'Unknown error';
        break;
    }
    return message;
  }

  async function login(data) {
    let loginData = {
      uid: '',
      token: ''
    };

    try {
      await clientAuth.signInWithEmailAndPassword(data.email, data.password);

      loginData.uid = clientAuth.currentUser.uid;
      loginData.token = await clientAuth
        .currentUser
        .getIdToken(true);

      baseService.returnData.message = 'Login successful';
    } catch (err) {
      console.error('Error in login: ', err);
      baseService.returnData.message = 'Error in login: ' + getSpecificErrorMessage(err.code);
    } finally {
      baseService.returnData.data = loginData;
    }

    return baseService.returnData;
  }

  async function checkLogin(email, password) {
    let flagAuthentication = false;

    try {
      let loginInfo = await login({
        email: email,
        password: password
      });
      baseService.returnData.message = loginInfo.message;
      flagAuthentication = loginInfo.data.uid !== '';
    } catch (err) {
      console.error('Error on reauthentication process: ', err);
      baseService.returnData.message = 'Error on reauthentication process';
      baseService.returnData.responseCode = 500;
    } finally {
      baseService.returnData.data = flagAuthentication;
    }

    return baseService.returnData;
  }

  async function changePassword(password) {
    let flagResult = false;
    let user = clientAuth.currentUser;

    try {
      await user.updatePassword(password);
      flagResult = true;
      baseService.returnData.message = 'Change password successfully';
    } catch (err) {
      console.error('Error updating password: ', err);
      baseService.returnData.message = 'Error updating password';
      baseService.returnData.responseCode = 500;
    } finally {
      baseService.returnData.data = flagResult;
    }

    return baseService.returnData;
  }

  async function changePasswordUsingAdminSDK(userId, newPassword) {
    try {
      const response = await adminAuth.updateUser(userId, {
        password: newPassword
      });

      baseService.returnData.data = response;
      baseService.returnData.message = 'Change password successfully';
    } catch (err) {
      const errorMessage = 'Error updating user password';
      console.error(errorMessage, err);
      baseService.returnData.message = errorMessage;
      baseService.returnData.responseCode = 500;
    }

    return baseService.returnData;
  }

  async function resetPassword(email) {
    try {
      await clientAuth.sendPasswordResetEmail(email, {
        url: 'https://belatrix-meetapp.firebaseapp.com'
      });
      baseService.returnData.message = 'An email was sent for resetting the password';
    } catch (err) {
      console.error('Error sending email for resetting password: ', err);
      baseService.returnData.message = 'Error sending email for resetting password';
      baseService.returnData.responseCode = 500;
    }

    return baseService.returnData;
  }

  async function logout() {
    try {
      await clientAuth.signOut();
      baseService.returnData.message = 'Sign out successfully';
    } catch (err) {
      console.error('Error sign out: ', err);
      baseService.returnData.message = 'Error sign out';
      baseService.returnData.responseCode = 500;
    }

    return baseService.returnData;
  }

  async function verifyToken(token) {
    let responseData = {
      verified: false
    };

    try {
      const currentToken = await adminAuth.verifyIdToken(token);

      if (!currentToken) {
        return {
          message: 'Unverified Token',
          data: responseData
        };
      }

      baseService.returnData.message = 'Successfully verified Token',
        responseData.verified = true;
    } catch (error) {
      console.error('Error while verifying token id', error);
      baseService.returnData.message = 'Error while verifying token id';
      baseService.returnData.responseCode = 500;
    } finally {
      baseService.returnData.data = responseData;
    }

    return baseService.returnData;
  }

  return {
    login,
    checkLogin,
    changePassword,
    changePasswordUsingAdminSDK,
    logout,
    verifyToken,
    resetPassword
  };
};
