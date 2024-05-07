// @ts-nocheck
'use strict';

/**
 * wisata controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::wisata.wisata', ({ strapi }) => ({
  async create(ctx) {
    try {
      // @ts-ignore
      const { data } = ctx.request.body
      const img_cover = ctx.request.files["files.img_cover"]
      const gallery = ctx.request.files["files.gallery"]

      const parsedData = typeof data === 'string' ? JSON.parse(data) : data

      const existedWisata = await strapi.db.query('api::wisata.wisata').findOne({
        where: {
          name: parsedData.name
        }
      })

      if (existedWisata) {
        return ctx.badRequest('Name Already exists')  
      }

      const currentDate = new Date()
      const newData = await strapi.entityService.create('api::wisata.wisata', {
        data: {
          ...parsedData,
          publishedAt: currentDate,
        }
      })

      if (img_cover && gallery !== undefined) {
        await strapi.plugin("upload").services.upload.upload({
          data: {
            ref: "api::wisata.wisata",
            refId: newData.id,
            field: 'img_cover',
            source: "wisata"
          },
          files: img_cover
        })

        await strapi.plugin("upload").services.upload.upload({
          data: {
            ref: "api::wisata.wisata",
            refId: newData.id,
            field: 'gallery',
            source: "wisata"
          },
          files: gallery
        })
      }

      ctx.send({
        message: 'Success Create New Wisata',
        data: newData,
      })
    } catch (error) {
      console.error(error);
      ctx.badRequest(error);
    }
  }
}));
