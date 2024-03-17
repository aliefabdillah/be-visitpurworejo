'use strict';

/**
 * artikel controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

// @ts-ignore
module.exports = createCoreController('api::artikel.artikel', ({ strapi }) => ({
  // custom create
  async create(ctx){
    // @ts-ignore
    const body = ctx.request.body
    const user = ctx.state.user;
    const currentDate = new Date()

    try {
      const resultData = await strapi.entityService.create('api::artikel.artikel', {
        data: {
          title: body.data.title,
          slug: body.data.slug,
          user_id: user.id,
          publishedAt: currentDate,
          status: 'draft'
        }
      })

      if (resultData) {
        ctx.send({ 
          message: 'Successfully created',
          data: resultData
        })
      }
    } catch (error) {
      console.error(error);
      ctx.badRequest(error);
    }
  },

  //get detail custom
  async getDetailArtikel(ctx) {
    // @ts-ignore
    const slug = ctx.request.params.slug;

    try {
      const resultData = await strapi.db.query('api::artikel.artikel').findOne({
        select: ['id', 'title', 'slug', 'short_content', 'publish_date', 'content'], 
        where: { slug: slug },
        populate: {
          img_cover: true,
          user_id: {
            select: ['id', 'username'],
            populate: { img_profile: true} 
          },
        }
      });

      // response body
      if (resultData) {
        ctx.send({ 
          data: resultData,  
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
            $and: [
              {
                ['kategori_id']: { 
                  slug: {$eqi: category}
                }
              },
              {
                status: 'published'
              }
            ]
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
          $and: [
            {
              ['kategori_id']: {
                name: { $eq: 'Pengalaman Wisata'}
              }
            },
            {
              status: 'published'
            }
          ]
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
  },

  async editUserArtikel(ctx){
    const userId = ctx.state.user.id
    // @ts-ignore
    const slugArtikel = ctx.request.params.slug
    // @ts-ignore
    const { data } = ctx.request.body
    // @ts-ignore
    const file = ctx.request.files['files.img_cover']
    const parsedData = JSON.parse(data)
    
    try {
      
      const entry = await strapi.db.query('api::artikel.artikel').update({
        data: parsedData,
        where: {
          slug: slugArtikel
        }
      })

      console.log(entry.id)

      await strapi.plugin("upload").services.upload.upload({
        data: {
          ref: "api::artikel.artikel",
          refId: entry.id,
          field: 'img_cover',
        },
        files: file
      })

      ctx.send({
        message: 'Artikel Updated',
        data: entry,
      })
    } catch (error) {
      console.error(error);
      ctx.badRequest('Error get cerita');
    }
  },

  async ajukanPublikasiArtikel(ctx){
    const userId = ctx.state.user.id
    // @ts-ignore
    const slugArtikel = ctx.request.params.slug

    try {
      await strapi.db.query('api::artikel.artikel').update({
        data: {
          status: 'verification'
        },
        where: {
          slug: slugArtikel
        }
      }).then((res) => {
        ctx.send({
          message: 'Ajukan Publikasi Artikel Successfully',
          data: res,
        })
      })
    } catch (error) {
      console.error(error);
      ctx.badRequest(error)
    }
  },
}));
