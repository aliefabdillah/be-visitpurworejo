'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/laporan-ulasans/warning-email/send',
      handler: 'laporan-ulasan.sendWarningEmail',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ]
}