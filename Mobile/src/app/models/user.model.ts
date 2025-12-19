export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    phone?: string;
    bio?: string;
    avatar_url?: string;
    laboratory_id?: number;
    institution_id?: number;
}
