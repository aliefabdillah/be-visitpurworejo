'use strict';

module.exports = {
  routes: [
    {
      method: 'PUT',
      path: '/profile/deactivate',
      handler: 'profile.deactivateAccount',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/profile/activate/mail-confirmation',
      handler: 'profile.sendEmailConfirmation',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/activate-account',
      handler: 'profile.activateAccount',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/profile/delete',
      handler: 'profile.deleteAccount',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/profiles/edit-profile/:id',
      handler: 'profile.editProfile',
      config: {
        policies: [],
        middlewares: [],
      },
    }
  ]
}