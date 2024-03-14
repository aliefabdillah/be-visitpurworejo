'use strict'

// custom route for ulasan

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/review-wisata',
      handler: 'ulasan.getReviewWisata',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ]
}