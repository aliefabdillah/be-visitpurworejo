'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/hadiahs/redeem-point/:id',
      handler: 'hadiah.redeemPoint',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ]
}