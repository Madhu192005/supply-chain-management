import { Request, Response } from 'express';
import {
    getAllProducts,
    getProductById,
    getProductBySku,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    getStockLog,
    getLowStockProducts
} from './inventory.queries';

// ─── Products ───────────────────────────────────────────

export const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const products = await getAllProducts();
        res.json({ products });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch products' });
    }
};

export const getProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await getProductById(parseInt(req.params.id as string));
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.json({ product });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch product' });
    }
};

export const addProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, sku, category, quantity, min_threshold, unit_price, supplier_id } = req.body;

        if (!name || !sku || !unit_price) {
            res.status(400).json({ message: 'Name, SKU, and unit price are required' });
            return;
        }

        // Check duplicate SKU
        const existing = await getProductBySku(sku);
        if (existing) {
            res.status(409).json({ message: 'SKU already exists' });
            return;
        }

        const product = await createProduct({
            name, sku, category, quantity: quantity || 0,
            min_threshold: min_threshold || 10,
            unit_price, supplier_id
        });

        res.status(201).json({ message: 'Product created', product });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create product' });
    }
};

export const editProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await updateProduct(parseInt(req.params.id as string), req.body);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.json({ message: 'Product updated', product });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update product' });
    }
};

export const removeProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await deleteProduct(parseInt(req.params.id as string));
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete product' });
    }
};

// ─── Stock ───────────────────────────────────────────────

export const adjustStock = async (req: Request, res: Response): Promise<void> => {
    try {
        const { change_amount, reason } = req.body;
        const productId = parseInt(req.params.id as string);
        const userId = (req as any).user.id;

        if (change_amount === undefined || !reason) {
            res.status(400).json({ message: 'change_amount and reason are required' });
            return;
        }

        const product = await updateStock(productId, change_amount, reason, userId);

        // Low stock warning in response
        const warning = product.quantity <= product.min_threshold
            ? `⚠️ Low stock alert: only ${product.quantity} units remaining`
            : null;

        res.json({ message: 'Stock updated', product, warning });
    } catch (err: any) {
        res.status(400).json({ message: err.message || 'Failed to update stock' });
    }
};

export const getStockHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const productId = req.params.id ? parseInt(req.params.id as string) : undefined;
        const logs = await getStockLog(productId);
        res.json({ logs });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch stock log' });
    }
};

export const getLowStock = async (req: Request, res: Response): Promise<void> => {
    try {
        const products = await getLowStockProducts();
        res.json({
            count: products.length,
            products
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch low stock products' });
    }
};