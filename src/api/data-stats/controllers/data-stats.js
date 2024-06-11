'use strict'

module.exports = {
  async countDataStats(ctx) {
    try {
      const articlesCount = await strapi.db.query('api::artikel.artikel').count({
        where: {
          status: { $eq: 'published'}
        }
      })
      const wisataCount = await strapi.db.query('api::wisata.wisata').count()
      const laporanCount = await strapi.db.query('api::laporan-ulasan.laporan-ulasan').count()
      const userCount = await strapi.db.query('plugin::users-permissions.user').count(
        {
          where: {
            isAdmin: { $eq: false}
          }
        }
      )

      ctx.send({ data: {
        "totalArticles": articlesCount,
        "totalWisata": wisataCount,
        "totalLaporan": laporanCount,
        "totalUser": userCount
      }})

    } catch (error) {
      // handle error
      console.error(error);
      ctx.badRequest('Error counting data stats: ' + error.message);
    }
  }
}