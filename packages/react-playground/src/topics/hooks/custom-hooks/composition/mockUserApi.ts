/**
 * ============================================================================
 * mockUserApi.ts — 本地 mock 用户搜索接口
 * ============================================================================
 *
 * 模拟真实后端搜索接口:300–800ms 随机延迟、支持 AbortSignal 中断、
 * 可注入失败(演示错误重试)。行为刻意贴近生产 HTTP 客户端,
 * 让 useRequest 的竞态/取消/错误处理都能被真实触发。
 *
 * @module topics/hooks/custom-hooks/composition/mockUserApi
 */

/** 用户领域模型 */
export interface User {
    id: number;
    name: string;
    role: string;
    city: string;
}

/* ---- 22 条本地用户数据 ---- */

const USERS: readonly User[] = [
    { id: 1, name: '张伟', role: '前端工程师', city: '北京' },
    { id: 2, name: '王芳', role: '后端工程师', city: '上海' },
    { id: 3, name: '李娜', role: '产品经理', city: '深圳' },
    { id: 4, name: '刘洋', role: '前端工程师', city: '杭州' },
    { id: 5, name: '陈静', role: 'UI 设计师', city: '广州' },
    { id: 6, name: '杨帆', role: '测试工程师', city: '北京' },
    { id: 7, name: '赵磊', role: '后端工程师', city: '成都' },
    { id: 8, name: '黄敏', role: '数据分析师', city: '上海' },
    { id: 9, name: '周杰', role: '前端工程师', city: '深圳' },
    { id: 10, name: '吴倩', role: '运营专员', city: '杭州' },
    { id: 11, name: '徐斌', role: '架构师', city: '北京' },
    { id: 12, name: '孙悦', role: 'UI 设计师', city: '广州' },
    { id: 13, name: '马超', role: '后端工程师', city: '西安' },
    { id: 14, name: '朱婷', role: '产品经理', city: '上海' },
    { id: 15, name: '胡军', role: '测试工程师', city: '成都' },
    { id: 16, name: '郭晓', role: '前端工程师', city: '南京' },
    { id: 17, name: '何欢', role: '数据分析师', city: '深圳' },
    { id: 18, name: '高翔', role: '运维工程师', city: '北京' },
    { id: 19, name: '林霞', role: '运营专员', city: '杭州' },
    { id: 20, name: '罗成', role: '架构师', city: '上海' },
    { id: 21, name: '郑爽', role: '前端工程师', city: '广州' },
    { id: 22, name: '梁宇', role: '后端工程师', city: '南京' },
];

/* ---- 失败注入开关(模块级,供页面「模拟接口失败」切换) ---- */

let shouldFail = false;

/** 打开 / 关闭失败注入;打开后所有请求都会以 500 失败 */
export const setMockFailure = (fail: boolean): void => {
    shouldFail = fail;
};

/* =================================================================
 * searchUsers — 模拟搜索接口
 * ================================================================ */

export interface SearchOptions {
    /** 取消信号:abort 后 Promise 立即 reject,不再返回结果 */
    signal?: AbortSignal;
}

/**
 * 按关键字搜索用户(姓名 / 角色 / 城市包含匹配,空关键字返回全部)。
 *
 * @param keyword 搜索关键字
 * @param options.signal AbortSignal,用于竞态取消与卸载取消
 * @returns 300–800ms 后 resolve 匹配用户列表;注入失败时 reject
 */
export function searchUsers(keyword: string, options: SearchOptions = {}): Promise<User[]> {
    const { signal } = options;

    return new Promise<User[]>((resolve, reject) => {
        const delay = 300 + Math.random() * 500;
        const timer = setTimeout(() => {
            cleanup();
            if (shouldFail) {
                reject(new Error('模拟接口失败:HTTP 500 Internal Server Error'));
                return;
            }
            const trimmed = keyword.trim().toLowerCase();
            const matched =
                trimmed === ''
                    ? [...USERS]
                    : USERS.filter(
                          (user) =>
                              user.name.toLowerCase().includes(trimmed) ||
                              user.role.toLowerCase().includes(trimmed) ||
                              user.city.toLowerCase().includes(trimmed),
                      );
            resolve(matched);
        }, delay);

        const onAbort = () => {
            clearTimeout(timer);
            cleanup();
            reject(new Error('请求已被取消(abort)'));
        };
        const cleanup = () => signal?.removeEventListener('abort', onAbort);

        // 已 abort 的信号直接拒绝,不再排队
        if (signal?.aborted) {
            clearTimeout(timer);
            reject(new Error('请求已被取消(abort)'));
            return;
        }
        signal?.addEventListener('abort', onAbort);
    });
}
