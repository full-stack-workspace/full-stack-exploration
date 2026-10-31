/**
 * ============================================================================
 * router — 路由(注册表派生)
 * ============================================================================
 *
 * 路由不由手写路由表维护,而是从 config/topics.ts 的 TOPICS 派生,
 * 保证「注册表 = 路由 = 导航」永不失配。另含首页、NotFound 兜底,
 * 以及 afterEach 中 document.title 的写入(react-playground DocumentTitle 的等价物)。
 *
 * @module router
 */

import { createRouter, createWebHistory } from 'vue-router';

import { SITE_NAME, SITE_TITLE } from '@/config/site';
import { getCategoryMeta, getTopicByPath, TOPICS } from '@/config/topics';

const router = createRouter({
    history: createWebHistory(),
    // 滚动行为:带 hash 时滚动到锚点(顶部留 64px 导航高度),否则回页面顶部
    scrollBehavior(to) {
        if (to.hash) {return { el: to.hash, top: 72, behavior: 'smooth' };}
        return { top: 0 };
    },
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('@/pages/Home/index.vue'),
        },
        // 专题路由全部由注册表派生
        ...TOPICS.map((t) => ({
            path: t.path,
            name: t.path,
            component: t.element,
        })),
        // 兜底:未注册路径渲染 NotFound,不静默跳回首页
        {
            path: '/:pathMatch(.*)*',
            name: 'not-found',
            component: () => import('@/pages/NotFound.vue'),
        },
    ],
});

router.afterEach((to) => {
    // 专题页标题格式:「专题 · 分类 · 站点名」,与 react-playground 的 DocumentTitle 对齐
    const topic = getTopicByPath(to.path);
    if (topic) {
        document.title = `${topic.title} · ${getCategoryMeta(topic.category).title} · ${SITE_NAME}`;
    } else {
        document.title = to.name === 'not-found' ? `页面不存在 · ${SITE_NAME}` : SITE_TITLE;
    }
});

export default router;
