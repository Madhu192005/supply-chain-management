import { Request, Response } from 'express';
import {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
} from './supplier.queries';

export const getSuppliers = async (req: Request, res: Response): Promise<void> => {
  try {
    const suppliers = await getAllSuppliers();
    res.json({ suppliers });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch suppliers' });
  }
};

export const getSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const supplier = await getSupplierById(parseInt(req.params.id as string));
    if (!supplier) {
      res.status(404).json({ message: 'Supplier not found' });
      return;
    }
    res.json({ supplier });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch supplier' });
  }
};

export const addSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name) {
      res.status(400).json({ message: 'Supplier name is required' });
      return;
    }

    const supplier = await createSupplier({ name, email, phone, address });
    res.status(201).json({ message: 'Supplier created', supplier });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create supplier' });
  }
};

export const editSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const supplier = await updateSupplier(parseInt(req.params.id as string), req.body);
    if (!supplier) {
      res.status(404).json({ message: 'Supplier not found' });
      return;
    }
    res.json({ message: 'Supplier updated', supplier });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update supplier' });
  }
};

export const removeSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const supplier = await deleteSupplier(parseInt(req.params.id as string));
    if (!supplier) {
      res.status(404).json({ message: 'Supplier not found' });
      return;
    }
    res.json({ message: 'Supplier deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete supplier' });
  }
};