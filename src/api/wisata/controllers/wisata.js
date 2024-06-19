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
  },

  async update(ctx){
    // @ts-ignore
    try {
      const { data } = ctx.request.body
      const img_cover = ctx.request.files["files.img_cover"]
      const gallery = ctx.request.files["files.gallery"]
      const wisataId = ctx.request.params.id

      const parsedData = typeof data === 'string' ? JSON.parse(data) : data
      const editedWisata = await strapi.db.query('api::wisata.wisata').findOne({
        where: {
          id: wisataId
        },
        populate: {
          img_cover: true,
          gallery: true,
        }
      })

      if (editedWisata.name !== parsedData.name) {
        const existedWisata = await strapi.db.query('api::wisata.wisata').findOne({
          where: {
            name: parsedData.name
          },
        })

        if (existedWisata) { 
          return ctx.badRequest('Wisata Name already exists')
        }
      }

      const currentDate = new Date()
      const newData = await strapi.entityService.update('api::wisata.wisata', wisataId, {
        data: {
          ...parsedData,
          updateAt: currentDate
        },
        populate: {
          img_cover: true,
          gallery: true,
        }
      })

      /* REPLACE COVER IMAGE ON CLOUD */
      if (img_cover !== undefined) {
        /* DELETE EXISTING IMAGE */
        if (editedWisata.img_cover) {
          const imageEntry = await strapi.db.query('plugin::upload.file').delete({
            where: { id: editedWisata.img_cover.id },
          });
  
          strapi.plugins.upload.services.upload.remove(imageEntry);
        }

        await strapi.plugin("upload").services.upload.upload({
          data: {
            ref: "api::wisata.wisata",
            refId: newData.id,
            field: 'img_cover',
            source: "wisata"
          },
          files: img_cover
        })
      }

      /* REPLACE GALLERY IMAGE ON CLOUD */
      if (gallery !== undefined && gallery.length > 0) {
        /* DELETE EXISTING IMAGE */
        if (editedWisata.gallery) {
          editedWisata.gallery.forEach(async (galleryItem) => {
            const galleryEntry = await strapi.db.query('plugin::upload.file').delete({
              where: { id: galleryItem.id },
            });
  
            strapi.plugins.upload.services.upload.remove(galleryEntry);
          })
        }

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
        message: 'Success Edit Wisata',
        data: newData,
      })
    } catch (error) {
      console.error(error);
      ctx.badRequest(error);
    }
  },

  async delete(ctx){
    try {
      const wisataId = ctx.request.params.id

      /* GET DELETED ITEM */
      const deletedWisata = await strapi.db.query('api::wisata.wisata').findOne({
        where: {
          id: wisataId
        },
        populate: {
          img_cover: true,
          gallery: true,
        }
      })

      /* DELETE GALERY IMAGE ON CLOUD */
      if (deletedWisata.gallery) {
        deletedWisata.gallery.forEach(async (galleryItem) => {
          const galleryEntry = await strapi.db.query('plugin::upload.file').delete({
            where: { id: galleryItem.id },
          });

          strapi.plugins.upload.services.upload.remove(galleryEntry);
        })
      }

      /* DELETE COVER IMAGE ON CLOUD */
      if (deletedWisata.img_cover) {
        const imageEntry = await strapi.db.query('plugin::upload.file').delete({
          where: { id: deletedWisata.img_cover.id },
        });

        strapi.plugins.upload.services.upload.remove(imageEntry);
      }

      /* DELETE WISATA ITEM */
      await strapi.entityService.delete('api::wisata.wisata', wisataId).then(() => {
        ctx.status = 200
        ctx.message = 'OK'
        ctx.body = {
          message: 'Successfully delete Wisata item'
        }
      })
    } catch (error) {
      console.error(error);
      ctx.badRequest('Failed to delete wisata!');
    }
  },

  async getWisataPopular(ctx){
    try {
      await strapi.db.query('api::wisata.wisata').findMany({
        populate: {
          wisata_favorite_id: true,
          img_cover: true,
          gallery: true,
        }
      }).then((res) => {
        ctx.send({
          message: 'Get Popular Wisata Success',
          data: res
        })
      })
    } catch (error) {
      console.error(error);
      ctx.badRequest('Failed to get wisata!');
    }
  },  
}));
