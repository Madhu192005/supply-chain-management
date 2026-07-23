export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'manager' | 'staff';
    is_active: boolean;
    created_at: Date;
}

export interface JwtPayload {
    id: number;
    email: string;
    role: string;
}

export interface RegisterBody {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'manager' | 'staff';
}

export interface LoginBody {
    email: string;
    password: string;
}