import 'vanilla-cookieconsent/dist/cookieconsent.css'
import * as CookieConsent from 'vanilla-cookieconsent'

export default {
  install: (app, pluginConfig) => {
    // Add CookieConsent to the global properties
    app.config.globalProperties.$CookieConsent = CookieConsent

    // Initialize the cookie consent banner
    CookieConsent.run(pluginConfig)
  },
}
