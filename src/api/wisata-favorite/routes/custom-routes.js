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
  ]
}