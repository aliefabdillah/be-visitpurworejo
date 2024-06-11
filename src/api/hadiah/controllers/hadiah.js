'use strict';

/**
 * hadiah controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::hadiah.hadiah', ({ strapi }) => ({
  async redeemPoint(ctx){
    // @ts-ignore
    const hadiahId = ctx.request.params.id
    const user = ctx.state.user
    var userPoint = parseInt(user.point);

    if (hadiahId === ':id') {
      ctx.notFound('Hadiah Not Found')
    }

    try {
      const hadiahData = await strapi.entityService.findOne('api::hadiah.hadiah', hadiahId)
      // console.log(hadiahData);

      if (userPoint < parseInt(hadiahData.redeem_point)) {
        ctx.status = 400
        ctx.message = 'BAD REQUEST'
        ctx.body = {
          error: {
            status: 400,
            name: 'Bad Request',
            message: 'Insufficient points!'
          }
        }
      } else {
        await strapi.entityService.update('plugin::users-permissions.user', user.id, {
          data: {
            point: userPoint - parseInt(hadiahData.redeem_point)
          }
        }).then(() => {
          ctx.status = 200;
          ctx.message = 'OK'
          ctx.body = {
            message: 'Successfully Redeem Point'
          }
        })
      }

    } catch (error) {
      console.error(error);
      ctx.badRequest(error);
    }
  }
}));
