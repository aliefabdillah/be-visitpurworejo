'use strict';

/**
 * laporan-ulasan controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::laporan-ulasan.laporan-ulasan', ({ strapi }) => ({
  async create(ctx) {
    // @ts-ignore
    const body = ctx.request.body;
    const user = ctx.state.user;
    const currentDate = new Date()

    let detail
    if (body.data.detail) {
      detail = body.data.detail
    }

    try {
      const result = await strapi.entityService.create('api::laporan-ulasan.laporan-ulasan', {
        data: {
          category: body.data.category,
          detail: detail,
          ulasan_id:  body.data.ulasan_id,
          report_date: currentDate,
          reporter_id: user.id,
          publishedAt: currentDate
        }
      });

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

  async find(ctx) {
    // @ts-ignore

    try {
      const result = await strapi.entityService.findMany('api::laporan-ulasan.laporan-ulasan', {
        populate: {
          ulasan_id: {
            populate: {
              user_id: {
                fields: ['id', 'username'],
              },
            }
          },
          reporter_id: true,
        },
        sort: { report_date: 'desc'}
      });

      ctx.send({
        code: 200,
        message: 'success',
        data: result
      });
    } catch (error) {
      console.error(error);
      ctx.badRequest("Failed to fetch data");
    }
  }
}));
