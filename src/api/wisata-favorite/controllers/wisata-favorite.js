'use strict';

/**
 * wisata-favorite controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::wisata-favorite.wisata-favorite', ({ strapi }) => ({
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
    } catch (error) {
      console.error(error);
      ctx.badRequest('Failed To Delete Favorite');
    }
  }
}));
