import colors from 'vuetify/es5/util/colors'
require('dotenv').config()

const baseUrl = process.env.BASE_URL || 'http://localhost:3000'

export default {
  /*
   ** Nuxt rendering mode
   ** See https://nuxtjs.org/api/configuration-mode
   */
  mode: 'universal',
  /*
   ** Nuxt target
   ** See https://nuxtjs.org/api/configuration-target
   */
  target: 'server',
  /*
   ** Headers of the page
   ** See https://nuxtjs.org/api/configuration-head
   */
  head: {
    titleTemplate: 'ツイ募',
    title: 'ツイ募',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: 'ツイッターで募集しよう！',
      },
      {
        hid: 'og:title',
        property: 'og:title',
        content: 'ツイ募',
      },
      {
        hid: 'og:description',
        property: 'og:description',
        content: 'ツイッターで募集しよう！',
      },
    ],
    link: [
      {
        rel: 'icon',
        sizes: '16x16',
        type: 'image/png',
        href: '/favicon-16.png',
      },
      {
        rel: 'icon',
        sizes: '32x32',
        type: 'image/png',
        href: '/favicon-32.png',
      },
      {
        rel: 'icon',
        sizes: '48x48',
        type: 'image/png',
        href: '/favicon-48.png',
      },
      {
        rel: 'icon',
        sizes: '62x62',
        type: 'image/png',
        href: '/favicon-62.png',
      },
      // apple touch icon
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
    ],
  },
  /*
   ** Global CSS
   */
  css: [],
  /*
   ** Plugins to load before mounting the App
   ** https://nuxtjs.org/guide/plugins
   */

  plugins: [
    { src: '~/plugins/vue-konva', ssr: false },
    { src: '~/plugins/firebase' },
    { src: '~/plugins/persistedstate', ssr: false },
  ],

  /*
   ** Auto import components
   ** See https://nuxtjs.org/api/configuration-components
   */
  components: true,
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: ['@nuxt/typescript-build', '@nuxtjs/vuetify'],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    // '@nuxtjs/pwa',
    // Doc: https://github.com/nuxt/content
    '@nuxt/content',
    '@nuxtjs/style-resources',
    '@nuxtjs/dotenv',
  ],

  styleResources: {
    scss: [],
  },

  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {},

  /*
   ** Content module configuration
   ** See https://content.nuxtjs.org/configuration
   */
  content: {},
  env: {
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_CLIENT_AUTH_DOMAIN: process.env.FIREBASE_CLIENT_AUTH_DOMAIN,
    FIREBASE_CLIENT_DATABASE_URL: process.env.FIREBASE_CLIENT_DATABASE_URL,
    FIREBASE_CLIENT_PROJECT_ID: process.env.FIREBASE_CLIENT_PROJECT_ID,
    FIREBASE_CLIENT_STORAGE_BUCKET: process.env.FIREBASE_CLIENT_STORAGE_BUCKET,
    FIREBASE_CLIENT_MESSAGING_SENDER_ID:
      process.env.FIREBASE_CLIENT_MESSAGING_SENDER_ID,
    FIREBASE_CLIENT_APP_ID: process.env.FIREBASE_CLIENT_APP_ID,
    FIREBASE_CLIENT_MEASUREMENT_ID:
      process.env.FIREBASE_CLIENT_MESSAGING_SENDER_ID,
    GOOGLE_ANALYTICS_TRACKING_ID: process.env.GOOGLE_ANALYTICS_TRACKING_ID,
    VERSION: process.env.VERSION,
    BASE_URL: baseUrl,
  },
  /*
   ** vuetify module configuration
   ** https://github.com/nuxt-community/vuetify-module
   */
  vuetify: {
    theme: {
      dark: false,
      white: true,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
        },
        light: {
          primary: '#204495',
          accent: '#FFC93C',
          secondary: '#6495ED',
          info: colors.teal.lighten1,
          warning: colors.deepOrange.base,
          error: colors.deepOrange.accent4,
          success: colors.lightGreen.base,
        },
      },
    },
  },
  /*
   ** Build configuration
   ** See https://nuxtjs.org/api/configuration-build/
   */
  build: {
    extend(config, { isServer }) {
      if (isServer) {
        config.externals = {
          '@firebase/app': 'commonjs @firebase/app',
          '@firebase/firestore': 'commonjs @firebase/firestore',
        }
      }
    },
  },
}
