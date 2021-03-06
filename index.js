const { Keystone } = require('@keystonejs/keystone');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const { Text, Checkbox, Password, File, Integer, Relationship, DateTime, } = require('@keystonejs/fields');
const { Markdown } = require('@keystonejs/fields-markdown');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { NuxtApp } = require('@keystonejs/app-nuxt');
const { LocalFileAdapter } = require('@keystonejs/file-adapters');
const { MongooseAdapter: Adapter } = require('@keystonejs/adapter-mongoose');
const { atTracking } = require('@keystonejs/list-plugins');
const expressSession = require('express-session');
const MongoStore = require('connect-mongo')(expressSession);
const { createItems } = require('@keystonejs/server-side-graphql-client');
require('dotenv').config();

const config = {
  endpoint: process.env.ENDPOINT,
  keystoneconfig: {
    name: "topdocs",
    secureCookies: process.env.NODE_ENV === 'production',
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Default to true in production
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      sameSite: false,
    },
    sessionStore: new MongoStore({ url: process.env.MONGOURI }),
    adapter: new Adapter({
      mongoUri: process.env.MONGOURI,
    }),
    cookieSecret: process.env.COOKIESECRET,
    onConnect: async () => {
      const users = await keystone.lists.User.adapter.findAll();
      if (!users.length) {
        await createItems({
          keystone,
          listKey: 'User',
          items: [{
            data: {
              name: 'admin',
              email: 'admin@admin.com',
              isAdmin: true,
              password: 'adminadmin'
            }
          }]
        })
      }
    }
  }
};
const keystone = new Keystone(config.keystoneconfig);
// Access control functions
const userIsAdmin = ({ authentication: { item: user } }) =>
  Boolean(user && user.isAdmin);
const userOwnsItem = ({ authentication: { item: user }, existingItem }) => {
  if (!user) {
    return false;
  }
  return existingItem.id === user.id;
};
const userIsAdminOrOwner = auth => {
  const isAdmin = access.userIsAdmin(auth);
  const isOwner = access.userOwnsItem(auth);
  return isAdmin ? isAdmin : isOwner;
};
const access = { userIsAdmin, userOwnsItem, userIsAdminOrOwner };

const fileAdaper = new LocalFileAdapter({
  src: './src/static/poster',
  path: '/poster',
})
keystone.createList('Image', {
  schemaDoc: '上传的附件图片，可以交给文档引用',
  fields: {
    file: {
      type: File,
      adapter: fileAdaper,
      isRequired: true,
    }
  },
  access: {
    create: access.userIsAdmin,
    update: access.userIsAdmin,
    delete: access.userIsAdmin
  },
  plugins: [
    atTracking(),
  ],
  label: 'File'
})
keystone.createList('Doc', {
  schemaDoc: '文档',
  fields: {
    name: { type: Text },
    md: { type: Markdown },
    category: { type: Relationship, ref: "Category" }
  },
  access: {
    create: access.userIsAdmin,
    update: access.userIsAdmin,
    delete: access.userIsAdmin
  },
  plugins: [
    atTracking(),
  ],
  label: 'Doc'
});
keystone.createList('Category', {
  schemaDoc: '文档分类',
  fields: {
    name: { type: Text },
  },
  access: {
    create: access.userIsAdmin,
    update: access.userIsAdmin,
    delete: access.userIsAdmin
  },
  plugins: [
    atTracking(),
  ],
  label: 'Category'
});
keystone.createList('Setting', {
  label: 'Setting',
  schemaDoc: 'CMS的核心设置',
  fields: {
    host: { type: Text, },
    name: { type: Text, defaultValue: "跨世代文档编辑系统" },
    seotitle: { type: Text, },
    keywords: { type: Text, },
    description: { type: Text, defaultValue: "跨世代文档编辑系统是新一代的实时在线动态文档系统，支持MARKDOWN语法。" },
    github: { type: Text },
    index: { type: Markdown }
  },
  plugins: [
    atTracking(),
  ],
  access: {
    create: access.userIsAdmin,
    update: access.userIsAdmin,
    delete: access.userIsAdmin
  },
})

keystone.createList('User', {
  label: 'User',
  fields: {
    name: { type: Text, isUnique: true },
    email: {
      type: Text,
      isUnique: true,
      access: {
        read: access.userIsAdminOrOwner,
      }
    },
    isAdmin: {
      type: Checkbox, access: {
        create: access.userIsAdmin,
        update: access.userIsAdmin,
      }
    },
    password: {
      type: Password,
      isRequired: true
    },
  },
  // To create an initial user you can temporarily remove access controls
  access: {
    update: access.userIsAdmin,
    delete: access.userIsAdmin,
  },
  plugins: [
    atTracking(),
  ],
});


const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
});

module.exports = {
  keystone,
  apps: [
    new GraphQLApp({
      apollo: {
        tracing: true,
        cacheControl: {
          defaultMaxAge: 3600,
        }
      }
    }),
    new AdminUIApp({ authStrategy }),
    new NuxtApp({
      srcDir: 'src',
      buildDir: 'dist',
      cache: true,
      mode: 'universal',
      loading: {
        color: '#fff',
      },
      /*
       ** Headers of the page
       */
      head: {
        title: 'moviecms',
        meta: [
          { charset: 'utf-8' },
          { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=0' },
        ],
        link: [
          { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
          { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/simplebar@latest/dist/simplebar.css' },
          // {
          //   rel: "stylesheet",
          //   href:
          //     "https://cdn.jsdelivr.net/npm/@mdi/font@4.x/css/materialdesignicons.min.css"
          // }
        ],
        script: [
          { src: 'https://cdn.jsdelivr.net/npm/simplebar@5.2.1/dist/simplebar.min.js' }
        ],
      },
      /*
      ** Load Vuetify into the app
      */
      plugins: [],
      build: {
        extractCSS: true,
      },
      /*
      ** Load Vuetify CSS globally
      */
      css: ['~/assets/app.css'],
      modules: ['@nuxtjs/apollo', "@nuxtjs/markdownit",
        ["@nuxtjs/moment", ["zh-cn"]], ['@nuxtjs/vuetify', {
          theme: {
            dark: true
          },
          defaultAssets: {
            icons: false
          },
          icons: {
            iconfont: 'mdiSvg', // default - only for display purposes
          },
        }], 'nuxt-ssr-cache'],
      cache: {
        // if you're serving multiple host names (with differing
        // results) from the same server, set this option to true.
        // (cache keys will be prefixed by your host name)
        // if your server is behind a reverse-proxy, please use
        // express or whatever else that uses 'X-Forwarded-Host'
        // header field to provide req.hostname (actual host name)
        useHostPrefix: false,
        pages: [
          // these are prefixes of pages that need to be cached
          // if you want to cache all pages, just include '/'
          '/'
        ],

        store: {
          type: 'redis',
          host: 'localhost',
          ttl: 10 * 60 * 60,
          configure: [
            // these values are configured
            // on redis upon initialization
            ['maxmemory', '200mb'],
            ['maxmemory-policy', 'allkeys-lru'],
          ],
        },
      },
      markdownit: {
        injected: true
      },
      apollo: {
        clientConfigs: {
          default: {
            httpEndpoint: config.endpoint,
          }
        }
      },
    }),
  ],
  configureExpress: app => {
    app.set('trust proxy', true);
  },
};
