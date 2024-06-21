'use strict';

/**
 * wisata-favorite controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::wisata-favorite.wisata-favorite', ({ strapi }) => ({
  async create(ctx){
    const { wisata_id } = ctx.request.query;
    const user_id = ctx.state.user.id;
    const publishedAt = new Date()

    try {
      await strapi.db.query('api::wisata-favorite.wisata-favorite').create({
        data: {
          wisata_id,
          user_id,
          publishedAt,
        }
      }).then((res) => {
        ctx.send({
          message: 'Add To Favorite Successful',
          data: res
        })
      })

    } catch (error) {
      console.error(error);
      ctx.badRequest(error);
    }
  },

  async deleteFromFavorite(ctx){
    const { wisata_id } = ctx.request.query;
    const user_id = ctx.state.user.id;

    try {
      await strapi.db.query('api::wisata-favorite.wisata-favorite').delete({
        where: {
          $and: [
            {
              wisata_id: wisata_id,
            },
            {
              user_id: user_id
            }
          ]
        }
      }).then((res) => {
        ctx.send({
          message: 'Delete from Favorite Successful',
          data: res
        })
      })

    } catch (error) {
      console.error(error);
      ctx.badRequest(error);
    }
  },

  async deleteAllFavorite(ctx){
    const user = ctx.state.user
    
    try {
      const toDelete = await strapi.db.query('api::wisata-favorite.wisata-favorite').findMany({
        where: {
          ['user_id']: {
            id: { $eq: user.id }
          }
        }
      });

      if (toDelete.length > 0) {
        await Promise.all(
          toDelete.map(({ id }) =>
            strapi.db.query("api::wisata-favorite.wisata-favorite").delete({
              where: { id },
            })
          )
        ).then((res)  => {
          ctx.status = 200;
          ctx.message = 'OK';
          ctx.body = {
            message: 'Successfully deleted all favorites'
          }
        });
      } else {
        ctx.status = 401
        ctx.message = 'NOT FOUND'
        ctx.body = {
          error: {
            status: 400,
            name: 'Not Found',
            message: 'All Favorite wisata already deleted'
          }
        }
      }
    } catch (error) {
      console.error(error);
      ctx.badRequest('Failed To Delete Favorite');
    }
  }
}));
