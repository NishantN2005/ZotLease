import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import VueCookieConsent from 'vue-cookieconsent'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(router)

app.use(VueCookieConsent, {
    // Customize options if necessary
    cookieName: 'yourCookieConsent',
    autoAccept: false, // Optionally require user interaction
    // You can also customize the banner text, button text, colors, etc.
  })

app.mount('#app')
