import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RegisterBody, LoginBody } from './auth.types';
import {
    findUserByEmail,
    findUserById,
    createUser,
    getAllUsers,
    toggleUserStatus
} from './auth.queries';

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role }: RegisterBody = req.body;

        // Validate fields
        if (!name || !email || !password || !role) {
            res.status(400).json({ message: 'All fields are required' });
            return;
        }

        const validRoles = ['admin', 'manager', 'staff'];
        if (!validRoles.includes(role)) {
            res.status(400).json({ message: 'Invalid role' });
            return;
        }

        // Check existing user
        const existing = await findUserByEmail(email);
        if (existing) {
            res.status(409).json({ message: 'Email already registered' });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await createUser(name, email, hashedPassword, role);

        res.status(201).json({
            message: 'User created successfully',
            user
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password }: LoginBody = req.body;

        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }

        // Find user
        const user = await findUserByEmail(email);
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as object
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await findUserById((req as any).user.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ user });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await getAllUsers();
        res.json({ users });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const toggleUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const user = await toggleUserStatus(parseInt(id as string));
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ message: 'User status updated', user });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
};