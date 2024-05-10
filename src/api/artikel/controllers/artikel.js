// @ts-nocheck
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

  async find(ctx){
    const { status } = ctx.request.query

    try {
      var resultData
      if (status) {
        resultData = await strapi.entityService.findMany('api::artikel.artikel', {
          populate: ['img_cover', 'kategori_id', 'user_id'],
          filters: {
            status: {
              $contains: status === 'published' ? 'published' : status === 'draft' ? 'draft' : 'verification',
            }
          }
        })
      } else {
        resultData = await strapi.entityService.findMany('api::artikel.artikel', {
          populate: ['img_cover', 'kategori_id', 'user_id'],          
        })
      }

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

  async delete(ctx){
    try {
      const artikelId = ctx.request.params.id

      /* GET DELETED ITEM */
      const deletedArtikel = await strapi.db.query('api::artikel.artikel').findOne({
        where: {
          id: artikelId
        },
        populate: {
          img_cover: true,
          user_id: true,
          kategori_id: true
        }
      })

      /* DELETE COVER IMAGE ON CLOUD */
      if (deletedArtikel.img_cover) {
        const imageEntry = await strapi.db.query('plugin::upload.file').delete({
          where: { id: deletedArtikel.img_cover.id },
        });

        strapi.plugins.upload.services.upload.remove(imageEntry);
      }

      /* DELETE ARTIKEL ITEM */
      await strapi.entityService.delete('api::artikel.artikel', artikelId).then(() => {
        ctx.status = 200
        ctx.message = 'OK'
        ctx.body = {
          message: 'Successfully delete Artikel item'
        }
      })
    } catch (error) {
      console.error(error);
      ctx.badRequest('Failed to delete wisata!');
    }
  },

  /* UPLOAD  ARTIKEL ADMIN CUSTOM */
  async createArtikelAdmin(ctx){
    const userId = ctx.state.user.id
    const { data } = ctx.request.body
    const file = ctx.request.files['files.img_cover']
    console.log(file)
    const parsedData = JSON.parse(data)
    const currentDate = new Date()

    try {
      const resultData = await strapi.entityService.create('api::artikel.artikel', {
        data: {
          ...parsedData,
          status: 'draft',
          user_id: userId,
          publishedAt: currentDate,
        },
        populate: {
          img_cover: true,
          user_id: true,
          kategori_id: true
        }
      })

      if (file !== undefined) {
        await strapi.plugin("upload").services.upload.upload({
          data: {
            ref: "api::artikel.artikel",
            refId: resultData.id,
            field: 'img_cover',
          },
          files: file
        })
      }

      ctx.send({
        message: 'Successfully created Artikel',
        data: resultData
      })
    } catch (error) {
      console.error(error);
      ctx.badRequest(error.message);
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

      // console.log(entry.id)

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
  
  async editAdminArtikel(ctx){
    const userId = ctx.state.user.id
    // @ts-ignore
    const artikelId = ctx.request.params.id
    // @ts-ignore
    const { data } = ctx.request.body
    // @ts-ignore
    const file = ctx.request.files['files.img_cover']
    const parsedData = JSON.parse(data)
    const currentDate = new Date()

    try {
      const entry = await strapi.db.query('api::artikel.artikel').update({
        data: {
          ...parsedData,
          updatedAt: currentDate
        },
        where: {
          id: artikelId
        },
        populate: {
          img_cover: true,
          user_id: true,
          kategori_id: true
        }
      })

      // console.log(entry.id)

      /* REPLACE IMAGE */
      if (file !== undefined) {
        if (entry.img_cover) {
          /* delete image on cloude */
          const imageEntry = await strapi.db.query('plugin::upload.file').delete({
            where: { id: entry.img_cover.id},
          })

          strapi.plugins.upload.services.upload.remove(imageEntry)
        }

        await strapi.plugin("upload").services.upload.upload({
          data: {
            ref: "api::artikel.artikel",
            refId: entry.id,
            field: 'img_cover',
          },
          files: file
        })
      }


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
    const currentDate = new Date()
    // @ts-ignore
    const slugArtikel = ctx.request.params.slug

    try {
      await strapi.db.query('api::artikel.artikel').update({
        data: {
          status: 'verification',
          updateAt: currentDate
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

  async revisiArtikel(ctx){
    const { data } = ctx.request.body
    const artikelId = ctx.request.params.id
    if (!data) {
      ctx.badRequest('Entry data not found');
    }
    const parsedData = JSON.parse(data)
    const currentDate = new Date()

    try {
      await strapi.db.query('api::artikel.artikel').update({
        data: {
          ...parsedData,
          status: 'draft',
          updatedAt: currentDate,
        },
        where: {
          id: artikelId,
        }
      }).then((res) => {
        ctx.send({
          message: 'Send Revisi Artikel Successfully',
          data: res,
        })
      })
    } catch (error) {
      console.error(error.message);
      ctx.badRequest('Failed To Send Revisi Artikel');
    }
  },

  async publishArtikel(ctx){
    const artikelId = ctx.request.params.id
    const currentDate = new Date()

    try {
      await strapi.db.query('api::artikel.artikel').update({
        data: {
          status: 'published',
          updatedAt: currentDate
        },
        where: {
          id: artikelId
        }
      }).then((res) => {
        ctx.send({
          message: 'Publish Artikel Successful',
          data: res,
        })
      })
    } catch (error) {
      console.error(error.message);
      ctx.badRequest('Failed To Publish Artikel');
    }
  }
}));
