export interface Product {
    id: number;
    name: string;
    sku: string;
    category: string;
    quantity: number;
    min_threshold: number;
    unit_price: number;
    supplier_id: number | null;
    created_at: Date;
}

export interface StockLog {
    id: number;
    product_id: number;
    change_amount: number;
    reason: string;
    changed_by: number;
    created_at: Date;
}

export interface CreateProductBody {
    name: string;
    sku: string;
    category: string;
    quantity: number;
    min_threshold: number;
    unit_price: number;
    supplier_id?: number;
}

export interface UpdateStockBody {
    change_amount: number;
    reason: string;
}