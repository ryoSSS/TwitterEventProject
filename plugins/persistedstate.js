import createPersistedState from 'vuex-persistedstate'

// In case of HMR, mutation occurs before nuxReady, so previously saved state
// gets replaced with original state received from server. So, we've to skip HMR.
// Also nuxtReady event fires for HMR as well, which results multiple registration of
// vuex-persistedstate plugin
export default ({ store /* isHMR, isClient */ }) => {
  window.onNuxtReady((/* nuxt */) => {
    createPersistedState({
      paths: ['user'],
    })(store) // vuex plugins can be connected to store, even after creation
  })
}
