import { createApp } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import './style.css'
import App from './App.vue'
import router from './router'

dayjs.locale('ru')

createApp(App).use(Antd).use(router).mount('#app')
