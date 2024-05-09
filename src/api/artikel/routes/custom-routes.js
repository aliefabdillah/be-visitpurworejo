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
    {
      method: 'GET',
      path: '/artikels/detail/:slug',
      handler: 'artikel.getDetailArtikel',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/artikels/edit-artikels/:slug',
      handler: 'artikel.editUserArtikel',
      config: {
        policies: [],
        middlewares: [],
      }
    },
    {
      method: 'PUT',
      path: '/artikels/admin-edit/:id',
      handler: 'artikel.editAdminArtikel',
      config: {
        policies: [],
        middlewares: [],
      }
    },
    {
      method: 'PUT',
      path: '/ajukan-publikasi/:slug',
      handler: 'artikel.ajukanPublikasiArtikel',
      config: {
        policies: [],
        middlewares: [],
      }
    },
    {
      method: 'POST',
      path: '/artikels/admin-upload',
      handler: 'artikel.createArtikelAdmin',
      config: {
        policies: [],
        middlewares: [],
      }
    },
  ]
}