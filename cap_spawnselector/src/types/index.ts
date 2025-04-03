export interface SpawnLocation {
    id: string;
    name: string;
    description: string;
    x: number;
    y: number;
    color: string;
    icon?: string;
    status?: 'online' | 'offline' | 'restricted';
}