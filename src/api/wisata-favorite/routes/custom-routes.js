'use strict';

module.exports = {
  routes: [
    {
      method: 'DELETE',
      path: '/wisata-favorites/delete/all',
      handler: 'wisata-favorite.deleteAllFavorite',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/wisata-favorites/delete/favorites',
      handler: 'wisata-favorite.deleteFromFavorite',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ]
}