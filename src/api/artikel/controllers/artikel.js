'use strict';

/**
 * artikel controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

// @ts-ignore
module.exports = createCoreController('api::artikel.artikel', ({ strapi }) => ({
  // show artikel in hero section
  async getHeroArtikel(ctx){
    try {
      const data =  await strapi.db.query("api::artikel.artikel").findMany({
        select: ['id', 'title', 'slug', 'short_content'],
        limit: 5,
        populate: {
          kategori_id: {
            select: ['id', 'name'], 
          },
          user_id: {
            select: ['id', 'username'], 
          },
          img_cover: true,
        },
        where: {
          $and: [
            {
              ['kategori_id']: {
                name: { $eq: 'Aktivitas Wisata'}
              }
            },{
              ['user_id']: {
                username: { $containsi: 'Admin' }
              }
            },{
              status: { $eq: 'published'}
            }
          ]
        }
      });

      ctx.send({ data: data})
    } catch (error) {
      console.error(error);
      ctx.badRequest('Error get Articles');
    }
  },

  // show articles by category
  async getArtikelByCategory(ctx) {
    const { category, page } = ctx.request.query

    // pagination
    const pageQuery = parseInt(page && page.toString()) || 1
    const limit = 9
    const offset = (pageQuery - 1) * limit
  
    try {
      // get articles
      let resultData
      if (category !== "") {
        resultData = await strapi.db.query('api::artikel.artikel').findMany({
          select: ['id', 'title', 'slug', 'content'],
          populate: ['img_cover'], 
          where: {
            ['kategori_id']: { 
              slug: {$eqi: category}
            }
          },
          offset: offset,
          limit: limit
        })
      } else {
        resultData = await strapi.db.query('api::artikel.artikel').findMany({
          select: ['id', 'title', 'slug', 'content'],
          populate: ['img_cover'],
          orderBy: { publishedAt: 'DESC'},
          offset: offset,
          limit: limit
        })
      }

      // item count
      const totalCount = await strapi.db.query('api::artikel.artikel').count({
        where: {
          ['kategori_id']: {
            slug: { $eqi: category }
          }
        },
      });
      
      // pagecount
      const pageCount = Math.ceil(totalCount / limit);
      
      // response body
      if (resultData) {
        ctx.send({ 
          data: resultData, 
          meta: {
            pagination: {
              totalCount: totalCount,
              pageCount: pageCount,
              currentPage: pageQuery,
              pageSize: limit
            }
          }, 
        })
      }else {
        ctx.send({
          data: {
            code: 401,
            message: "Articles Not Found"
          }
        })
      }

    } catch (error) {
      console.error(error);
      ctx.badRequest('Error get Articles');
    }
  },

  async getCeritaKami(ctx) {
    try {
      const data =  await strapi.db.query("api::artikel.artikel").findMany({
        select: ['id', 'title', 'slug', 'short_content'],
        limit: 5,
        populate: {
          user_id: {
            select: ['id', 'username', 'hometown'],
            populate: {
              img_profile: true
            }
          },
          img_cover: true,
        },
        where: {
          ['kategori_id']: {
            name: { $eq: 'Pengalaman Wisata'}
          }
        }
      });

      if (data) {
        ctx.send({ data: data})
      } else {
        ctx.send({
          data: {
            code: 401,
            message: "Cerita Not Found"
          }
        })
      }

    } catch (error) {
      console.error(error);
      ctx.badRequest('Error get cerita');
    }
  }
}));
