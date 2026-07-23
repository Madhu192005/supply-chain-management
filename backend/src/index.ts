import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/database';
import authRoutes from './modules/auth/auth.routes';
import { errorHandler } from './middleware/error.middleware';
// Add this import at the top
import inventoryRoutes from './modules/inventory/inventory.routes';
import supplierRoutes from './modules/suppliers/supplier.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Test DB connection
try {
    const row = db.prepare("SELECT datetime('now') AS now").get() as any;
    console.log('✅ DB connected at:', row.now);
} catch (err) {
    console.error('❌ DB connection failed:', err);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Supply Chain API running' });
});

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;