export interface Supplier {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    created_at: Date;
}

export interface CreateSupplierBody {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
}