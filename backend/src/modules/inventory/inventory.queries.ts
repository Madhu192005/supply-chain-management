import db from '../../config/database';
import { CreateProductBody, Product } from './inventory.types';

// ─── Products ───────────────────────────────────────────

export const getAllProducts = async () => {
    const rows = db.prepare(`
    SELECT p.*, s.name AS supplier_name
    FROM products p
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    ORDER BY p.created_at DESC
  `).all();
    return rows;
};

export const getProductById = async (id: number) => {
    const row = db.prepare(`
    SELECT p.*, s.name AS supplier_name
    FROM products p
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    WHERE p.id = ?
  `).get(id);
    return row || null;
};

export const getProductBySku = async (sku: string) => {
    const row = db.prepare(
        'SELECT * FROM products WHERE sku = ?'
    ).get(sku);
    return row || null;
};

export const createProduct = async (data: CreateProductBody) => {
    const result = db.prepare(`
    INSERT INTO products (name, sku, category, quantity, min_threshold, unit_price, supplier_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
        data.name,
        data.sku,
        data.category,
        data.quantity,
        data.min_threshold,
        data.unit_price,
        data.supplier_id || null
    );
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    return row;
};

export const updateProduct = async (id: number, data: Partial<CreateProductBody>) => {
    const fields = [];
    const values: any[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.category !== undefined) { fields.push('category = ?'); values.push(data.category); }
    if (data.min_threshold !== undefined) { fields.push('min_threshold = ?'); values.push(data.min_threshold); }
    if (data.unit_price !== undefined) { fields.push('unit_price = ?'); values.push(data.unit_price); }
    if (data.supplier_id !== undefined) { fields.push('supplier_id = ?'); values.push(data.supplier_id); }

    if (fields.length === 0) return null;

    values.push(id);
    db.prepare(`
    UPDATE products SET ${fields.join(', ')}
    WHERE id = ?
  `).run(...values);

    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    return row || null;
};

export const deleteProduct = async (id: number) => {
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!row) return null;
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    return row;
};

// ─── Stock Management ────────────────────────────────────

export const updateStock = async (
    productId: number,
    changeAmount: number,
    reason: string,
    changedBy: number
): Promise<Product> => {
    const performUpdate = db.transaction((): Product => {
        // Check current stock
        const current = db.prepare(
            'SELECT quantity FROM products WHERE id = ?'
        ).get(productId) as { quantity: number } | undefined;

        if (!current) throw new Error('Product not found');

        const newQuantity = current.quantity + changeAmount;

        if (newQuantity < 0) {
            throw new Error(`Insufficient stock. Current: ${current.quantity}`);
        }

        // Update product quantity
        db.prepare(
            'UPDATE products SET quantity = ? WHERE id = ?'
        ).run(newQuantity, productId);

        // Log the change
        db.prepare(`
      INSERT INTO stock_log (product_id, change_amount, reason, changed_by)
      VALUES (?, ?, ?, ?)
    `).run(productId, changeAmount, reason, changedBy);

        // Return updated product
        const updated = db.prepare(
            'SELECT * FROM products WHERE id = ?'
        ).get(productId) as Product;
        return updated;
    });

    return performUpdate();
};

export const getStockLog = async (productId?: number) => {
    if (productId) {
        return db.prepare(`
      SELECT sl.*, p.name AS product_name, u.name AS changed_by_name
      FROM stock_log sl
      LEFT JOIN products p ON sl.product_id = p.id
      LEFT JOIN users u ON sl.changed_by = u.id
      WHERE sl.product_id = ?
      ORDER BY sl.created_at DESC
    `).all(productId);
    } else {
        return db.prepare(`
      SELECT sl.*, p.name AS product_name, u.name AS changed_by_name
      FROM stock_log sl
      LEFT JOIN products p ON sl.product_id = p.id
      LEFT JOIN users u ON sl.changed_by = u.id
      ORDER BY sl.created_at DESC
      LIMIT 100
    `).all();
    }
};

// ─── Low Stock Alerts ────────────────────────────────────

export const getLowStockProducts = async () => {
    const rows = db.prepare(`
    SELECT p.*, s.name AS supplier_name
    FROM products p
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    WHERE p.quantity <= p.min_threshold
    ORDER BY p.quantity ASC
  `).all();
    return rows;
};