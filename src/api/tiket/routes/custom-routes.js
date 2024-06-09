'use strict'

// custom route for ulasan

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/tikets/get/ticket-by-user',
      handler: 'tiket.findByUser',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/tikets/by-order-id/:orderId',
      handler: 'tiket.findByOrderId',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ]
}