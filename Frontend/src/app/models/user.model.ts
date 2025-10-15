export interface User {
  id: number;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
  bio?: string | null;
  phone?: string | null;
  institution_id?: number | null;
  is_verified: number;
  created_at: string;
  updated_at: string;
}
