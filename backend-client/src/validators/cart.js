import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be positive').default(1),
  variantId: z.string().uuid('Invalid variant ID').optional(),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive('Quantity must be positive'),
});

export const mergeCartSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    variantId: z.string().uuid().optional(),
  })),
});
