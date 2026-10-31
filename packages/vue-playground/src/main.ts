/**
 * ============================================================================
 * main — 应用入口
 * ============================================================================
 *
 * 装配 Pinia(状态管理)、vue-router(路由)与 Element Plus(组件库),
 * 并引入 Element Plus 暗色 css-vars(与 .dark class 策略配套)。
 *
 * @module main
 */

import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import './index.css';

import ElementPlus from 'element-plus';
import { createPinia } from 'pinia';
import { createApp } from 'vue';

import App from './App.vue';
import router from './router';

createApp(App).use(createPinia()).use(router).use(ElementPlus).mount('#app');
