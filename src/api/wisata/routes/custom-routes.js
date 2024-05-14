'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/wisatas/get/popular',
      handler: 'wisata.getWisataPopular',
      config: {
        policies: [],
        middlewares: [],
      }
    }
  ]
}