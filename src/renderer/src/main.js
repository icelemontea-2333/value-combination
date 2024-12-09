import './style.css'
import { createApp } from 'vue'
import router from '@renderer/router'
import { createPinia } from 'pinia'
import App from './App.vue'

let app = createApp(App);
const pinia = createPinia();
app.use(router).use(pinia).mount('#app')