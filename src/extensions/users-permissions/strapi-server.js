const _ = require('lodash');
const {
  validateCallbackBody,
  validateRegisterBody,
} = require('../../../node_modules/@strapi/plugin-users-permissions/server/controllers/validation/auth');
const {
  getService,
} = require('../../../node_modules/@strapi/plugin-users-permissions/server/utils');
const utils = require('@strapi/utils');

const {ApplicationError, ValidationError, ForbiddenError} = utils.errors;
const {sanitize} = utils

module.exports = (plugin) => {
  plugin.controllers.auth.callback = async (ctx) => {
    const provider = ctx.params.provider || 'local';
    const params = ctx.request.body;

    const store = strapi.store({type: 'plugin', name: 'users-permissions'});
    const grantSettings = await store.get({key: 'grant'});

    const grantProvider = provider === 'local' ? 'email' : provider;

    if (!_.get(grantSettings, [grantProvider, 'enabled'])) {
      throw new ApplicationError('This provider is disabled');
    }

    if (provider === 'local') {
      await validateCallbackBody(params);

      const {identifier} = params;

      // Check if the user exists.
      const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: {
          provider,
          $or: [{email: identifier.toLowerCase()}, {username: identifier}],
        },
        populate: {
          img_profile: {
            select: ['id', 'name', 'alternativeText', 'caption', 'width', 'height', 'ext', 'mime', 'url']
          }
        },
      });

      if (!user) {
        throw new ValidationError('User not found');
      }

      if (!user.password) {
        throw new ValidationError('Your password is incorrect');
      }

      const validPassword = await getService('user').validatePassword(
        params.password,
        user.password
      );

      if (!validPassword) {
        throw new ValidationError('Your password is not valid');
      }

      const advancedSettings = await store.get({key: 'advanced'});
      const requiresConfirmation = _.get(advancedSettings, 'email_confirmation');

      if (requiresConfirmation && user.confirmed !== true) {
        throw new ApplicationError('Your account email is not confirmed');
      }

      if (user.blocked === true) {
        throw new ApplicationError('Your account has been blocked by an administrator');
      }

      return ctx.send({
        jwt: getService('jwt').issue({id: user.id}),
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          provider: user.provider,
          confirmed: user.confirmed,
          blocked: user.blocked,
          isAdmin: user.isAdmin,
          isActive: user.isActive,
          point: parseInt(user.point),
          asal_daerah: user.asal_daerah,
          fullname: user.fullname,
          img_profile: user.img_profile
        }
      });
    }

    // Connect the user with the third-party provider.
    try {
      const user = await getService('providers').connect(provider, ctx.query);

      if (user.blocked) {
        throw new ForbiddenError('Your account has been blocked by an administrator');
      }

      return ctx.send({
        jwt: getService('jwt').issue({id: user.id}),
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          provider: user.provider,
          confirmed: user.confirmed,
          blocked: user.blocked,
          isAdmin: user.isAdmin,
          isActive: user.isActive,
          point: parseInt(user.point),
          asal_daerah: user.asal_daerah,
          fullname: user.fullname,
          img_profile: user.img_profile
        }
      });
    } catch (error) {
      throw new ApplicationError(error.message);
    }
  }

  return plugin
}