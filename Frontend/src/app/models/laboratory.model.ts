export interface Laboratory {
    id: number;
    institution_id: number;
    name: string;
    description?: string;
    location?: string;
    capacity?: number;
    created_at?: string;
    updated_at?: string;
    institution_name?: string;
}
