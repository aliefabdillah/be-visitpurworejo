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

  async getReviewWisata(ctx) {
    const { jenis_wisata } = ctx.request.query

    if (!jenis_wisata) {
      ctx.badRequest('parameter not found')
    }

    try {
      const resultData = await strapi.db.query('api::ulasan.ulasan').findMany({
        select: ['id', 'content'],
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
          ['post_wisata_id']: {
            jenis_wisata: { $eq: jenis_wisata}
          }
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
  }
}));
