'use strict';

module.exports = {
  routes: [
    {
      method: 'DELETE',
      path: '/profile/wisata-favorites/all',
      handler: 'wisata-favorite.deleteAllFavorite',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/delete-favorites',
      handler: 'wisata-favorite.deleteFromFavorite',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ]
}