import db from '../../config/database';
import { User } from './auth.types';

export const findUserByEmail = async (email: string): Promise<User | null> => {
    const row = db.prepare(
        'SELECT * FROM users WHERE email = ? AND is_active = 1'
    ).get(email) as User | undefined;
    return row || null;
};

export const findUserById = async (id: number): Promise<User | null> => {
    const row = db.prepare(
        'SELECT id, name, email, role, is_active, created_at FROM users WHERE id = ?'
    ).get(id) as User | undefined;
    return row || null;
};

export const createUser = async (
    name: string,
    email: string,
    hashedPassword: string,
    role: string
): Promise<User> => {
    const stmt = db.prepare(
        `INSERT INTO users (name, email, password, role)
     VALUES (?, ?, ?, ?)`
    );
    const result = stmt.run(name, email, hashedPassword, role);
    const user = db.prepare(
        'SELECT id, name, email, role, is_active, created_at FROM users WHERE id = ?'
    ).get(result.lastInsertRowid) as User;
    return user;
};

export const getAllUsers = async (): Promise<User[]> => {
    const rows = db.prepare(
        'SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC'
    ).all() as User[];
    return rows;
};

export const toggleUserStatus = async (id: number): Promise<User | null> => {
    db.prepare(
        'UPDATE users SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?'
    ).run(id);
    const row = db.prepare(
        'SELECT id, name, email, role, is_active FROM users WHERE id = ?'
    ).get(id) as User | undefined;
    return row || null;
};