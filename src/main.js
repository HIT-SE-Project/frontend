import './assets/main.css'

import { createApp } from 'vue'
// ElementPlus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// Pinia
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-persistedstate-plugin'

import App from './App.vue'
import router from './router/index.js'

const app = createApp(App)
const pinia = createPinia()

// Pinia持久化配置
const persist = createPersistedState()
pinia.use(persist)

app.use(ElementPlus)
// ElementPlus Icons 全局导入
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(pinia)
app.use(router) // 在这里正确注入 Vue Router 实例
app.mount('#app')
