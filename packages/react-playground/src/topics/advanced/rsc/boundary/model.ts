/**
 * ============================================================================
 * model — RSC 边界规则(纯数据,不执行服务端)
 * ============================================================================
 *
 * 把「谁必须在客户端、谁不该进包、Client 能不能 import Server」写成可判定的结论。
 * 页面只负责切换,结论来自这里,避免示意和文案各说各话。
 *
 * @module topics/advanced/rsc/boundary/model
 */

export type Side = 'server' | 'client';

export interface Piece {
    id: string;
    title: string;
    job: string;
    /** 需要状态或事件,标成 Server 就是非法边界 */
    needsClient: boolean;
    /** 读数据库或密钥,标成 Client 会把秘密带进浏览器图 */
    serverOnly: boolean;
    /** 标成 Client 时会额外进包的库 */
    heavyLib?: string;
}

export const PIECES: readonly Piece[] = [
    {
        id: 'body',
        title: '商品正文',
        job: '读数据库,用 markdown 库渲染成只读内容',
        needsClient: false,
        serverOnly: true,
        heavyLib: 'markdown 解析器',
    },
    {
        id: 'price',
        title: '价格与库存',
        job: '请求时读取,没有点击逻辑',
        needsClient: false,
        serverOnly: true,
    },
    {
        id: 'cart',
        title: '加入购物车',
        job: '按钮、pending 状态、点击',
        needsClient: true,
        serverOnly: false,
    },
    {
        id: 'filter',
        title: '规格筛选',
        job: '本地选中态,筛选项一点就变',
        needsClient: true,
        serverOnly: false,
    },
    {
        id: 'recs',
        title: '推荐列表',
        job: '异步读取推荐,本身不需要事件',
        needsClient: false,
        serverOnly: true,
    },
];

export interface BoundaryState {
    side: Record<string, Side>;
    /** 规格筛选文件顶部直接 import 推荐列表 */
    importRecIntoFilter: boolean;
}

export const INITIAL_STATE: BoundaryState = {
    side: {
        body: 'server',
        price: 'server',
        cart: 'client',
        filter: 'client',
        recs: 'server',
    },
    importRecIntoFilter: false,
};

export interface Finding {
    level: 'error' | 'warn' | 'ok';
    text: string;
}

const pieceById = (id: string): Piece | undefined => PIECES.find((piece) => piece.id === id);

/**
 * 根据当前切分给出违规、客户端包和 RSC 载荷里会出现的东西。
 * @param state 每个区域的归属,以及筛选是否直接 import 推荐
 */
export function explain(state: BoundaryState): {
    findings: Finding[];
    bundle: string[];
    payload: string[];
} {
    const findings: Finding[] = [];
    const bundle: string[] = [];
    const payload: string[] = [];

    for (const piece of PIECES) {
        const side = state.side[piece.id] ?? 'server';
        if (side === 'client') {
            bundle.push(piece.title);
            if (piece.heavyLib) {
                bundle.push(piece.heavyLib);
            }
            payload.push(`${piece.title}:客户端槽位(实现在 JS 包里)`);
            if (piece.needsClient) {
                findings.push({
                    level: 'ok',
                    text: `${piece.title}需要状态或事件,放在 Client Component 是对的。`,
                });
            }
            if (piece.serverOnly) {
                findings.push({
                    level: 'error',
                    text: `${piece.title}标成了 Client,数据库或密钥会跟着依赖图进入浏览器。`,
                });
            } else if (piece.heavyLib) {
                findings.push({
                    level: 'warn',
                    text: `${piece.heavyLib}会进入客户端包。只为渲染用的库更适合留在 Server Component。`,
                });
            }
        } else {
            payload.push(`${piece.title}:服务端渲染结果(序列化进 RSC 载荷,实现不进包)`);
            if (piece.needsClient) {
                findings.push({
                    level: 'error',
                    text: `${piece.title}标成了 Server,但它要状态或事件。Server Component 不会在浏览器里为了点击再执行一次。`,
                });
            }
        }
    }

    // PIECES 是模块内常量表,filter 理论上必存在;可选链兜底避免非空断言
    const filterTitle = pieceById('filter')?.title ?? '规格筛选';
    const recsSide = state.side.recs ?? 'server';
    const filterSide = state.side.filter ?? 'client';
    if (state.importRecIntoFilter && filterSide === 'client' && recsSide === 'server') {
        findings.push({
            level: 'error',
            text: `${filterTitle}是 Client Component,不能 import 仍是 Server Component 的推荐列表。由 Server 父组件把推荐作为 children 传进来。`,
        });
    } else if (state.importRecIntoFilter && filterSide === 'client' && recsSide === 'client') {
        findings.push({
            level: 'warn',
            text: '这样能通过编译,但推荐的取数和渲染会全部进客户端包。',
        });
    } else if (!state.importRecIntoFilter && filterSide === 'client' && recsSide === 'server') {
        findings.push({
            level: 'ok',
            text: '推荐列表由 Server 父组件渲染后,作为 children 填进筛选壳。这是 Client 与 Server 能组合的方向。',
        });
    }

    const errors = findings.filter((item) => item.level === 'error');
    if (errors.length === 0 && bundle.length > 0 && payload.some((line) => line.includes('服务端渲染结果'))) {
        findings.unshift({
            level: 'ok',
            text: '这条边界在支持 RSC 的框架里成立。交互叶子在客户端,读库和重渲染留在服务端。',
        });
    }
    if (bundle.length === PIECES.length + PIECES.filter((piece) => piece.heavyLib).length) {
        findings.unshift({
            level: 'warn',
            text: '整页都标成 Client,等于在根上写了 use client。RSC 没有参与,包也没有变小。',
        });
    }

    return { findings, bundle, payload };
}
