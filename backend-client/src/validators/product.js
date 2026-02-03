import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  comparePrice: z.number().positive().optional(),
  currency: z.string().default('EUR'),
  sku: z.string().optional(),
  stock: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  categoryId: z.string().uuid('Invalid category ID'),
  images: z.array(z.object({
    url: z.string().url('Invalid image URL'),
    alt: z.string().optional(),
    position: z.number().int().min(0).default(0),
  })).optional(),
  variants: z.array(z.object({
    name: z.string().min(1),
    value: z.string().min(1),
    price: z.number().positive().optional(),
    stock: z.number().int().min(0).default(0),
    sku: z.string().optional(),
  })).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(1).max(5).optional(),
  sortBy: z.enum(['price', 'name', 'createdAt', 'rating']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  isFeatured: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
});
