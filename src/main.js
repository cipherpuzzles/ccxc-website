import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import './style.css'
import App from './App.vue'
import router from './router'

// Font Awesome 配置
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faEye, 
  faEyeSlash, 
  faSpinner, 
  faCheckCircle, 
  faExclamationTriangle, 
  faTimesCircle, 
  faInfoCircle 
} from '@fortawesome/free-solid-svg-icons'

// 添加图标到库
library.add(faEye, faEyeSlash, faSpinner, faCheckCircle, faExclamationTriangle, faTimesCircle, faInfoCircle)

const app = createApp(App)
const pinia = createPinia()

// 使用持久化插件
pinia.use(piniaPluginPersistedstate)

// 全局注册 FontAwesome 组件
app.component('font-awesome-icon', FontAwesomeIcon)

app.use(pinia)
app.use(router)
app.mount('#app')
