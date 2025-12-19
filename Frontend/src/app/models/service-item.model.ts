export interface ServiceItem {
    id: number;
    laboratory_id: number;
    name: string;
    description?: string;
    status: 'available' | 'maintenance' | 'in_use';
    created_at?: string;
    updated_at?: string;
}
