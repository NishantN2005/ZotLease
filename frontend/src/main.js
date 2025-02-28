import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import CookieConsentVue from './CookieConsentVue'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(router)

app.use(CookieConsentVue, {
  guiOptions: {
    consentModal: {
      layout: 'cloud', // Simple and clean layout
      position: 'bottom center', // Position at the bottom center
      equalWeightButtons: true, // Buttons have equal width
    },
    preferencesModal: {
      layout: 'box', // Simple layout for preferences modal
      position: 'right', // Position on the right side
    },
  },
  categories: {
    necessary: {
      enabled: true, // Necessary cookies are always enabled
      readOnly: true, // Users cannot disable necessary cookies
    },
    analytics: {
      enabled: true, // Disabled by default
      readOnly: false, // Users can enable/disable analytics cookies
    },
  },
  language: {
    default: 'en',
    translations: {
      en: {
        consentModal: {
          title: 'We use cookies', // Short and clear title
          description:
            'We use cookies to enhance your experience. By clicking "Accept", you agree to our use of cookies.', // Short description
          acceptAllBtn: 'Accept', // Single button for simplicity
          showPreferencesBtn: 'Preferences', // Optional: Show preferences button
        },
        preferencesModal: {
          title: 'Cookie Preferences', // Simple title
          acceptAllBtn: 'Accept all', // Accept all button
          acceptNecessaryBtn: 'Reject all', // Reject all button
          savePreferencesBtn: 'Save preferences', // Save button
          closeIconLabel: 'Close', // Close button label
          sections: [
            {
              title: 'Cookie Usage',
              description: 'We use cookies to ensure you get the best experience on our website.', // Short description
            },
            {
              title: 'Necessary Cookies',
              description: 'These cookies are essential for the website to function properly.', // Short description
              linkedCategory: 'necessary',
            },
            {
              title: 'Analytics Cookies',
              description:
                'These cookies help us understand how visitors interact with the website.', // Short description
              linkedCategory: 'analytics',
            },
          ],
        },
      },
    },
  },
})

app.mount('#app')
