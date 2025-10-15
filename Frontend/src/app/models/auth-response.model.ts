import { User } from './user.model';

// Solo los campos que realmente devuelve el login
export type AuthUser = Pick<User, 'id' | 'email' | 'first_name' | 'last_name' | 'role'>;

export interface AuthResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}
