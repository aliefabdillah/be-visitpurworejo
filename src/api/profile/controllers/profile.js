'use strict';

const { uuid } = require('uuidv4');
const crypto = require('crypto');
const _ = require('lodash')

module.exports = {
  async deactivateAccount(ctx) {
    const user = ctx.state.user

    try {
      await strapi.entityService.update('plugin::users-permissions.user', user.id, {
        data: {
          isActive: false
        }
      }).then(() => {
        ctx.status = 200
        ctx.message = 'OK'
        ctx.body = {
          message: 'Your account has been deactivated'
        }
      })
    } catch (error) {
      console.error(error);
      ctx.badRequest(error);
    }
  },

  async activateAccount(ctx) {  
    const { username, confirmationToken } = ctx.request.query

    try {
      const accountData = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: {
          confirmationToken: confirmationToken
        }
      })

      if (accountData) {
        await strapi.entityService.update('plugin::users-permissions.user', accountData.id, {
          data: {
            isActive: true,
            confirmationToken: null
          }
        }).then((res) => {
          ctx.status = 200
          ctx.message = 'OK'
          ctx.body = {
            message: 'Account Activated',
            data: res
          }
        })
      }
    } catch (error) {
      console.error(error);
      ctx.badRequest(error);
    }
  },

  async sendEmailConfirmation(ctx) {
    const body = ctx.request.body

    try {
      const accountData = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: {
          email: body.data.email
        }
      })

      // console.log(accountData);

      if (accountData){
        ctx.notFound({
          data: {
            code: 401,
            message: "Account Not Found"
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

      //send email verification logic
      const verificationToken = uuid();
      const hashedConfirmationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

      await strapi.entityService.update('plugin::users-permissions.user', accountData.id, {
        data: {
          confirmationToken: hashedConfirmationToken,
        }
      })

      await strapi.plugins['email'].services.email.send(
        {
          to: accountData.email,
          subject: `Welcome ${accountData.username}`,
          text: `Activate Account Confirimation`,
          html: `<h1>Acitvate Your Account!</h1>
            <p>You have to confirm your email address. Please click on the link below.</p>

            <p>http://localhost:1337/api/activate-account?username=${accountData.username}&confirmationToken=${hashedConfirmationToken}</p>
            
            <p>Thanks.</p>`,
          from: 'no-reply@info.com'
          // from: is not specified, the defaultFrom is used.
        }
      )

      ctx.send({
        message: 'Email verification link sent successfully',
      });

    } catch (error) {
      console.error(error);
      ctx.badRequest(error)
    }
  },

  async deleteAccount(ctx){
    const user = ctx.state.user

    try {
      await strapi.entityService.delete('plugin::users-permissions.user', user.id).then(() => {
        ctx.status = 200
        ctx.message = 'OK'
        ctx.body = {
          message: 'Your account has been deleted'
        }
      })
    } catch (error) {
      console.error(error);
      ctx.badRequest(error);
    }
  },

  async editProfile(ctx){
    const userAuthId = ctx.state.user.id
    const profileId = ctx.request.params.id

    if (userAuthId !== profileId) {
      ctx.forbidden('Cannot edit profile')
    }

    try {
      const { data } = ctx.request.body
      const file = ctx.request.files['files.img_profile']

      const parsedData = JSON.parse(data)
      
      const editedData = await strapi.db.query('plugin::users-permissions.user').findOne({
        select: ['id', 'email', 'username'],
        where: {
          id: profileId
        }
      })

      if (editedData.email !== parsedData.email) {
        const existedEmail = await strapi.db.query('plugin::users-permissions.user').findOne({
          where: {
            email: parsedData.email
          }
        })

        if (existedEmail) { 
          return ctx.badRequest('Email already exists')
        }
      }

      // console.log(parsedData.username)
      if (editedData.username !== parsedData.username) {
        const existedUsername = await strapi.db.query('plugin::users-permissions.user').findOne({
          where: {
            username: parsedData.username
          }
        })

        if (existedUsername) { 
          return ctx.badRequest('Username already exists')
        }
      }

      const entry = await strapi.entityService.update('plugin::users-permissions.user', profileId, {
        data: {
          ...parsedData,
        },
        populate: {
          img_profile: true
        }
      })

      if (file !== undefined) {
        if (entry.img_profile) {
          /* delete image on cloud */
          const imageEntry = await strapi.db.query('plugin::upload.file').delete({
            where: { id: entry.img_profile.id},
          })

          strapi.plugins.upload.services.upload.remove(imageEntry)
        }

        await strapi.plugin("upload").services.upload.upload({
          data: {
            ref: "plugin::users-permissions.user",
            refId: profileId,
            field: 'img_profile',
            source: "users-permissions"
          },
          files: file
        })
      }

      const newProfileData = await strapi.db.query('plugin::users-permissions.user').findOne({
        select: ['*'],
        populate: {
          img_profile: true
        },
        where: {
          id: profileId
        }
      })
      ctx.send({
        message: 'Profile Updated',
        data: newProfileData,
      })
    } catch (error) {
      console.error(error);
      ctx.badRequest(error);
    }
    
  }
};