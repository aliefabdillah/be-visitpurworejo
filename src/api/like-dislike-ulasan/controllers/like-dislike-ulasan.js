'use strict';

/**
 * like-dislike-ulasan controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::like-dislike-ulasan.like-dislike-ulasan', ({ strapi }) => ({
  async create(ctx){
    const user_id = ctx.state.user.id
    // @ts-ignore
    let { data }= ctx.request.body
    const publishedAt = new Date()
    
    data = { ...data, user_id, publishedAt}
    try {
      const entry = await strapi.entityService.create('api::like-dislike-ulasan.like-dislike-ulasan', {
        data: data
      })

      ctx.send({
        message: 'success',
        data: entry
      })

    } catch (error) {
      console.error(error);
      ctx.badRequest(error);
    }
  },

  async update(ctx){
    const user = ctx.state.user

    if (!user.authenticated) {
      ctx.forbidden('Login required')
    }

    // @ts-ignore
    const ulasan_id = ctx.request.params.id
    // @ts-ignore
    let { data }= ctx.request.body
    
    try {
      await strapi.db.query('api::like-dislike-ulasan.like-dislike-ulasan').update({
        where: {
          $and: [
            {
              ['ulasan_id']:{
                id: ulasan_id
              }
            },
            {
              ['user_id']: {
                id: user.id
              }
            }
          ]
        },
        data: {
          isLike: data.isLike,
          isDislike: data.isDislike
        }
      }).then(async (res) => {
        if (!res.isLike && !res.isDislike) {
          await strapi.db.query('api::like-dislike-ulasan.like-dislike-ulasan').delete({
            where: {
              id: res.id,
            }
          }).then((res) => {
            ctx.send({
              message: 'success update and delete',
            })
          })
        }
        ctx.send({
          message: 'success update',
          data: res
        })
      })
    } catch (error) {
      console.error(error);
      ctx.badRequest(error);
    }
  },
}));
