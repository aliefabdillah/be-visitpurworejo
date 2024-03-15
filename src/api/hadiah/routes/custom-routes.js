'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/profile/redeem-point/:id',
      handler: 'hadiah.redeemPoint',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ]
}