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
                fields: ['id', 'username', 'email'],
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
  },

  async sendWarningEmail(ctx) {
    const { email, ulasanId } = ctx.request.query

    try {
      const accountData = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: {
          email: email
        }
      })

      const ulasanData = await strapi.db.query('api::ulasan.ulasan').findOne({
        where: {
          $and: [
            {
              id: ulasanId
            },
            {
              isDeleted: false
            }
          ]
        },
        populate: {
          post_wisata_id: {
            select: ['id', 'name'],
          },
        }
      })

      // console.log(accountData);

      if (accountData){
        ctx.notFound({
          data: {
            code: 401,
            message: "Account does not exist"
          }
        })
      }

      if (accountData.blocked) {
        ctx.forbidden({
          data: {
            code: 403,
            message: "Account Was Blocked by Admin"
          }
        })
      }

      await strapi.plugins['email'].services.email.send({
        to: accountData.email,
        subject: `Peringatan: Komentar/Ulasan Melanggar Peraturan`,
        text: `Peringatan Komentar/Ulasan`,
        html: `<h1>Peringatan: Komentar/Ulasan Melanggar Peraturan</h1>
          <p>Dear <strong>${accountData.username}</strong>,</p>
          <p>Kami ingin memberi tahu Anda bahwa salah satu komentar atau ulasan yang Anda buat di website wisata Kabupaten Purworejo telah melanggar peraturan komunitas kami.</p>
          <p><strong>Detail Komentar:</strong> <i>"${ulasanData.content}"</i></p>
          <p><strong>Halaman Wisata:</strong> <i>${ulasanData.post_wisata_id.name}</i></p>
          <p>Harap perhatikan bahwa kami memiliki pedoman dan peraturan yang harus dipatuhi oleh semua pengguna. Pelanggaran terhadap peraturan ini dapat mengakibatkan tindakan lebih lanjut, termasuk penghapusan komentar/ulasan Anda dan, dalam kasus tertentu, penangguhan atau penghentian akun Anda.</p>
          <p>Jika Anda memiliki pertanyaan atau memerlukan klarifikasi lebih lanjut, silakan hubungi tim dukungan kami.</p>
          <p>Terima kasih atas pengertian dan kerjasamanya.</p>
          <p>Salam,</p>
          <p>Tim Pengelola Website Wisata Kabupaten Purworejo</p>`,
        from: 'no-reply@info.com'
      });
      
      ctx.send({
        message: 'Warning email sent successfully',
      });
    } catch (error) {
      console.error(error);
      ctx.badRequest(error)
    }
  }
}));
