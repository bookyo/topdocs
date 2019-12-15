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
const config = {
  endpoint: 'http://127.0.0.1:3000/admin/api',
  keystoneconfig: {
    name: "topdocs",
    secureCookies: false,
    sessionStore: new MongoStore({ url: 'mongodb://topdocs:topdocs@127.0.0.1:27017/topdocs' }),
    adapter: new Adapter({
      mongoUri: 'mongodb://topdocs:topdocs@127.0.0.1:27017/topdocs',
    }),
    cookieSecret: "toperdocsmyfever",
    onConnect: async () => {
      const users = await keystone.lists.User.adapter.findAll();
      if (!users.length) {
        const initialData = require('./initialData');
        await keystone.createItems(initialData);
      }
    }
  }
};
const keystone = new Keystone(config.keystoneconfig);
// Access control functions
const userIsAdmin = ({ authentication: { item: user } }) =>
  Boolean(user && user.isAdmin);
const userOwnsItem = ({ authentication: { item: user } }) => {
  if (!user) {
    return false;
  }
  return { id: user.id };
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
  label: '附件'
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
  label: '文档'
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
  label: '文档分类'
});
keystone.createList('Setting', {
  label: '设置',
  schemaDoc: 'CMS的核心设置',
  fields: {
    host: { type: Text, },
    name: { type: Text, defaultValue: "跨世代文档编辑系统" },
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
  label: '用户',
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
          {
            rel: "stylesheet",
            href:
              "https://cdn.jsdelivr.net/npm/@mdi/font@4.x/css/materialdesignicons.min.css"
          }
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
            iconfont: 'mdi', // default - only for display purposes
          },
        }]],
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
};
