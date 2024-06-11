'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/artikels/get/hero-artikels',
      handler: 'artikel.getHeroArtikel',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/artikels/get/by-category',
      handler: 'artikel.getArtikelByCategory',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/artikels/get/cerita-kami',
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
      method: 'GET',
      path: '/artikels/get/artikel-account',
      handler: 'artikel.getArtikelAccount',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/artikels/edit-artikels/:id',
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
      path: '/artikels/ajukan-publikasi/:slug',
      handler: 'artikel.ajukanPublikasiArtikel',
      config: {
        policies: [],
        middlewares: [],
      }
    },
    {
      method: 'PUT',
      path: '/artikels/publikasi/:id',
      handler: 'artikel.publishArtikel',
      config: {
        policies: [],
        middlewares: [],
      }
    },
    {
      method: 'PUT',
      path: '/artikels/revisi/:id',
      handler: 'artikel.revisiArtikel',
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