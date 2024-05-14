'use strict';

/**
 * ulasan controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::ulasan.ulasan', ({ strapi }) => ({
  async create(ctx) {
    // @ts-ignore
    const body = ctx.request.body;
    const user = ctx.state.user;
    let userPoint = parseInt(user.point)
    const currentDate = new Date()

    try {
      const result = await strapi.entityService.create('api::ulasan.ulasan', {
        data: {
          content: body.data.content,
          user_id: user.id,
          post_wisata_id: body.data.post_wisata_id,
          parent_comment_id: body.data.parent_comment_id,
          replied_to_id: body.data.replied_to_id,
          posting_date: currentDate,
          publishedAt: currentDate
        }
      })

      await strapi.entityService.update('plugin::users-permissions.user', user.id, {
        data: {
          point: ++userPoint
        }
      })

      ctx.send({
        code: 200,
        message: 'success',
        data: result
      })
    } catch (error) {
      console.error(error);
      ctx.badRequest("Failed to Create");
    }
  },

  async delete(ctx) {
    // @ts-ignore
    const ulasanId = ctx.request.params.id
    const user = ctx.state.user;
    let userPoint = parseInt(user.point);

    if (ulasanId === ':id') {
      return ctx.notFound('issue report not found!')
    }

    try {
      await strapi.entityService.update('api::ulasan.ulasan', ulasanId, {
        data: {
          isDeleted: true
        }
      }).then((res) => {
        ctx.response.status = 200
        ctx.response.message = 'OK'
        ctx.response.body = {
          message: 'Success delete',
          data: res
        }
      })

      //decrese point
      await strapi.entityService.update('plugin::users-permissions.user', user.id, {
        data: {
          point: --userPoint
        }
      })

    } catch (error) {
      console.error(error);
      ctx.badRequest("Failed to Delete");
    }
  },

  async getTotalUlasanWisata(ctx){
    // @ts-ignore
    const slug = ctx.request.params.slug

    try {
      const resultData = await strapi.db.query('api::ulasan.ulasan').count({
        where: {
          $and: [
            {
              ['post_wisata_id']: {
                slug: { $eq : slug}
              },
            },
            {
              isDeleted: false
            }
          ]
          
        }
      });

      ctx.send({ data: resultData })

    } catch (error) {
      console.error(error);
      ctx.badRequest("Failed to Get Ulasan");
    }
  },

  async getUlasanByWisata(ctx){
    // @ts-ignore
    const slug = ctx.request.params.slug
    const { category } = ctx.request.query

    let sortFilter
    if (category === 'Best' || category === '') {
      sortFilter = { like : 'desc' }
    }
    if (category === 'Newest') {
      sortFilter = { posting_date : 'desc' }
    }
    if (category === 'Oldest') {
      sortFilter = { posting_date : 'asc' }
    }

    try {
      const resultData = await strapi.db.query('api::ulasan.ulasan').findMany({
        select: ['id', 'content', 'like', 'dislike', 'posting_date'],
        orderBy: sortFilter,
        where: {
          $and:[
            {
              ['post_wisata_id']:{
                slug: slug
              }
            },
            {
              parent_comment_id: null
            }
          ]
        },
        populate: {
          user_id: {
            select: ['id', 'username'],
            populate: {
              img_profile: true
            }
          },
          child_comment_id: {
            select: ['id', 'content', 'like', 'dislike', 'posting_date'],
            populate: {
              user_id: {
                select: ['id', 'username'],
                populate: {
                  img_profile: true
                }
              },
              replied_to_id:{
                select: ['id'],
                populate: {
                  user_id: {
                    select: ['id', 'username'],
                  }
                }
              },
              like_dislike_ulasan_id: {
                select: ['id', 'isLike', 'isDislike'],
                populate: {
                  user_id: {
                    select: ['id', 'username'],
                  }
                }
              }
            }
          },
          like_dislike_ulasan_id: {
            select: ['id', 'isLike', 'isDislike'],
            populate: {
              user_id: {
                select: ['id', 'username'],
              }
            }
          }
        }
      });

      if (resultData) {
        ctx.send({ data: resultData });
      } else {
        ctx.send({
          data: {
            code: 401,
            message: "Ulasan Not Found"
          }
        })
      }

    } catch (error) {
      console.error(error);
      ctx.badRequest("Failed to Get Ulasan");
    }
  },

  async getReviewWisata(ctx) {
    const { jenis_wisata } = ctx.request.query

    if (!jenis_wisata) {
      ctx.badRequest('parameter not found')
    }

    try {
      const resultData = await strapi.db.query('api::ulasan.ulasan').findMany({
        select: ['id', 'content', 'like'],
        limit: 5,
        populate: {
          user_id: {
            select: ['id', 'username', 'hometown'],
            populate: {
              img_profile: true
            }
          },
        },
        where: {
          $and: [
            {
              ['post_wisata_id']: {
                jenis_wisata: { $eq: jenis_wisata}
              }
            },
            {
              isDeleted: false
            }
          ]
        }
      })

      if (resultData.length > 0) {
        ctx.send({ data: resultData })
      } else {
        ctx.send({
          data: {
            code: 401,
            message: "Review Not Found"
          }
        })
      }
    } catch (error) {
      console.error(error);
      ctx.badRequest('Error get Review Wisata');
    }
  },

  async getUlasanAccount(ctx){
    const user = ctx.state.user

    try {
      const ulasanData = await strapi.db.query('api::ulasan.ulasan').findMany({
        select: ['id', 'content', 'posting_date'],
        populate: {
          user_id: {
            select: ['id', 'username'],
            populate: {
              img_profile: true
            }
          },
          child_comment_id: true,
          post_wisata_id: {
            select: ['id', 'name'],
          }
        },
        where: {
          $and: [
            {
              ['user_id']: {
                id: user.id
              }
            },
            {
              isDeleted: false
            }
          ]
        }
      });

      if (ulasanData.length > 0) {
        ctx.send({ data: ulasanData })
      } else {
        ctx.send({
          data: {
            code: 401,
            message: "Ulasan Not Found"
          }
        })
      }
    } catch (error) {
      console.error(error);
      ctx.badRequest('Error get Ulasan User');
    }
    
  },
}));
