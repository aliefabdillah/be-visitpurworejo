'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/hero-artikels',
      handler: 'artikel.getHeroArtikel',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/artikels-by-category',
      handler: 'artikel.getArtikelByCategory',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/cerita-kami',
      handler: 'artikel.getCeritaKami',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ]
}