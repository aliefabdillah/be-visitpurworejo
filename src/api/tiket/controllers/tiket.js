'use strict';

/**
 * tiket controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::tiket.tiket', ({ strapi }) => ({
  async create(ctx) {
    // @ts-ignore
    const { data } = ctx.request.body
    const user = ctx.state.user;
    const currentDate = new Date()

    try {
      const response = await strapi.entityService.create('api::tiket.tiket', {
        data: {
          ...data,
          user_id: user.id,
          publishedAt: currentDate
        }
      })

      ctx.send({
        code: 200,
        message: 'success create tickets',
        data: response
      })
    } catch (error) {
      console.error(error);
      ctx.badRequest("Failed to Create");
    }
  },

  async findByUser(ctx) {
    const user = ctx.state.user;
    try {
      const response = await strapi.db.query('api::tiket.tiket').findMany({
        populate: {
          user_id: true,
          wisata_id: {
            fields: ['id', 'name', 'slug', 'location', 'jenis_wisata', 'tiket']
          },
        },
        orderBy: { createdAt: "desc" },
        where: {
          user_id: user.id,
        }
      })

      ctx.send({
        code: 200,
        message: 'success get tickets',
        data: response
      })
    } catch (error) {
      console.error(error);
      ctx.badRequest("Failed to GET");
    }
  },

  async findByOrderId(ctx) {
    // @ts-ignore
    const orderId = ctx.request.params.orderId

    try {
      const response = await strapi.db.query('api::tiket.tiket').findOne({
        select: ['*'],
        where: { order_id: orderId},
        populate: {
          user_id: true,
          wisata_id: true,
        }
      })

      if (!response) {
        ctx.send({
          code: 400,
          message: 'Oops! Something went wrong',
        })
      }

      ctx.send({
        code: 200,
        message: 'Success get tickets',
        data: response
      })
    } catch (error) {
      console.error(error);
      ctx.badRequest("Failed to GET");
    }
  }
}));
