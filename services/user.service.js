'use strict';

const setupBaseService = require('./base.service');

module.exports = function setupUserService(adminInstance, dbInstance) {

  const adminAuth = adminInstance;
  const collection = dbInstance.collection('users');

  let baseService = new setupBaseService();

  async function create(userData) {
    let newUserResponse = null;

    try {
      let newUserAuthentication = await adminAuth.createUser({
        email: userData.email,
        emailVerified: false,
        password: userData.password,
        displayName: userData.name + ' ' + userData.lastName,
        disabled: false
      });

      newUserResponse = {
        userId: newUserAuthentication.uid,
        email: userData.email,
        name: userData.name,
        lastName: userData.lastName,
        isAdmin: userData.isAdmin,
        avatarUrl: '',
        isEnabled: true,
        role: userData.role
      };

      let newUserReference = await collection.add(newUserResponse);
      newUserResponse.id = newUserReference.id;

      baseService.returnData.message = 'User was successfully created.';
    } catch (err) {
      console.error('error: ', err);
      baseService.returnData.responseCode = 500;
      baseService.returnData.message = 'Error adding a user';
    } finally {
      baseService.returnData.data = newUserResponse;
    }

    return baseService.returnData;
  }

  async function doList() {
    let allUsers = [];

    try {
      let userRefSnapshot = await collection.get();

      userRefSnapshot.forEach((doc) => {
        let userData = doc.data();
        userData.id = doc.id;
        allUsers.push(userData);
      });

      baseService.returnData.message = 'Getting all user list information successfully.';
    } catch (err) {
      console.error('Error getting documents', err);
      baseService.returnData.responseCode = 500;
      baseService.returnData.message = 'Error getting user list information';
    } finally {
      baseService.returnData.data = allUsers;
    }

    return baseService.returnData;
  }

  async function findById(id) {
    let user = null;

    try {
      let userRefSnapshot = await collection
        .doc(id)
        .get();

      if (userRefSnapshot.exists) {
        user = userRefSnapshot.data();
      }

      user.id = id;
      baseService.returnData.message = 'Getting user information successfully';
    } catch (err) {
      console.error('Error getting user information', err);
      baseService.returnData.responseCode = 500;
      baseService.returnData.message = 'Error getting user information';
    } finally {
      baseService.returnData.data = user;
    }

    return baseService.returnData;
  }

  async function findByUserId(userId) {
    let user = null;

    try {
      let userRefSnapshot = await collection
        .where('userId', '==', userId)
        .limit(1)
        .get();

      if (userRefSnapshot.docs.length === 1) {
        user = userRefSnapshot.docs[0].data();
        user.id = userRefSnapshot.docs[0].id;
      }

      baseService.returnData.message = 'Getting user information successfully';
    } catch (err) {
      console.error('Error getting user information', err);
      baseService.returnData.responseCode = 500;
      baseService.returnData.message = 'Error getting user information';
    } finally {
      baseService.returnData.data = user;
    }

    return baseService.returnData;
  }

  /**
   * Disable user for removing operation
   * @param {String} id
   */
  async function toggleEnable(id) {
    try {
      let userInfoRef = await collection
        .doc(id)
        .get();

      const userData = userInfoRef.data();

      await collection
        .doc(id)
        .update({
          isEnabled: !userData.isEnabled
        });

      await adminAuth.updateUser(userData.userId, {
        disabled: !userData.isEnabled
      });

      baseService.returnData.message = 'User was deleted successfully';
    } catch (err) {
      console.error('Error removing a user: ', err);
      baseService.returnData.responseCode = 500;
      baseService.returnData.message = 'Error removing a user';
    } finally {
      baseService.returnData.data = {};
    }

    return baseService.returnData;
  }

  async function update(userId, userData) {
    let userResponse = null;

    try {
      await collection
        .doc(userId)
        .update(userData);

      let userInfoRef = await collection
        .doc(userId)
        .get();
      userResponse = {
        ...userInfoRef.data(),
        id: userId
      };

      baseService.returnData.message = 'User was updated successfully';
    } catch (err) {
      console.error('Error updating a user: ', err);
      baseService.returnData.responseCode = 500;
      baseService.returnData.message = 'Error updating a user';
    } finally {
      baseService.returnData.data = userResponse;
    }

    return baseService.returnData;
  }

  return {
    create,
    doList,
    findById,
    findByUserId,
    toggleEnable,
    update
  };
};
