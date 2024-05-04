'use strict'

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/data/stats',
      handler: 'data-stats.countDataStats',
      config: {
        policies: [],
        middlewares: [],
      }
    }
  ]
}