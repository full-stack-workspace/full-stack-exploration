export interface Stat {
    value: string;
    label: string;
}

export interface Value {
    id: string;
    title: string;
    description: string;
}

export interface TeamMember {
    name: string;
    role: string;
    image: string;
}

export interface AboutPageData {
    stats: Stat[];
    values: Value[];
    team: TeamMember[];
}