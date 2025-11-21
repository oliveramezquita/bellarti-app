import App from '@/App.vue'
import selectAllOnFocus from '@/directives/selectAllOnFocus'
import { registerPlugins } from '@core/utils/plugins'
import { createApp } from 'vue'

// Styles
import '@core/scss/template/index.scss'
import '@styles/styles.scss'

// Create vue app
const app = createApp(App)

// Register plugins
registerPlugins(app)

app.directive('select-all-on-focus', selectAllOnFocus)

// Mount vue app
app.mount('#app')
