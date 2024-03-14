'use strict';

module.exports = {
  routes: [
    {
      method: 'DELETE',
      path: '/wisatas/favorites/all',
      handler: 'wisata-favorite.deleteAllFavorite',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ]
}