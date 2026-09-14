/**
 * @file 卡片配置
 */

export interface CardItem {
    id: string;
    title: string;
    description: string;
    link: string;
    date: string;
    tags: string[];
}

export const BASE_CARD_LIST: CardItem[] = [
    {
        id: 'card-1',
        title: 'React',
        description: 'A JavaScript library for building user interfaces.',
        link: 'https://reactjs.org/',
        date: '2025-12-11',
        tags: ['JavaScript', 'Library', 'Frontend']
    },
    {
        id: 'card-2',
        title: 'TypeScript',
        description: 'A superset of JavaScript that adds static typing.',
        link: 'https://www.typescriptlang.org/',
        date: '2025-12-12',
        tags: ['JavaScript', 'Superset', 'Static Typing']
    },
    {
        id: 'card-3',
        title: 'Next.js',
        description: 'A React framework for server-rendered applications.',
        link: 'https://nextjs.org/',
        date: '2025-12-13',
        tags: ['React', 'Framework', 'Server Rendering']
    }
]
