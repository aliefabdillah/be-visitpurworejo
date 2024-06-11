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
  email: {
    config: {
      provider: env('EMAIL_PROVIDER'),
      providerOptions: {
        host: env('EMAIL_SMTP_HOST', 'smtp.example.com'),
        port: env('EMAIL_SMTP_PORT', 587),
        auth: {
          user: env('EMAIL_SMTP_USER'),
          pass: env('EMAIL_SMTP_PASS'),
        },
      },
      settings: {
        defaultFrom: env('EMAIL_ADDRESS_FROM'),
        defaultReplyTo: env('EMAIL_ADDRESS_REPLY'),
      },
    }
  },
  /* upload: {
    config: {
      providerOptions: {
        localServer: {
          maxage: 300000
        },
      },
    },
  }, */
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_API_KEY'),
        api_secret: env('CLOUDINARY_API_SECRET'),
      },
      actionOptions: {
        upload: {},
        uploadStream: {
          folder: env("CLOUDINARY_FOLDER"),
       },
        delete: {},
      },
    },
  },
  ckeditor: true,
});
