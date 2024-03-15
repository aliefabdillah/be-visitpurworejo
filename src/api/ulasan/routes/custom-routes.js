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
    {
      method: 'GET',
      path: '/total-ulasan/:slug',
      handler: 'ulasan.getTotalUlasanWisata',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/ulasan-wisata/:slug',
      handler: 'ulasan.getUlasanByWisata',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/ulasan-account',
      handler: 'ulasan.getUlasanAccount',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ]
}