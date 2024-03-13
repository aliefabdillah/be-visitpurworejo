module.exports = ({ env }) => ({
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '1d',
      },
    },
  },
  slugify: {
    enabled: true,
    config: {
      contentTypes: {
        wisata: {
          field: "slug",
          references: "name",
        },
        artikel: {
          field: "slug",
          references: "title",
        },
      },
    },
  },
});
