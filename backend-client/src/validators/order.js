import { z } from 'zod';

export const createOrderSchema = z.object({
  addressId: z.string().uuid('Invalid address ID').optional(),
  address: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().optional(),
    postalCode: z.string().min(1),
    country: z.string().default('ES'),
    phone: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
});

export const addressSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  street: z.string().min(1, 'Street is required').max(200),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().max(100).optional(),
  postalCode: z.string().min(1, 'Postal code is required').max(20),
  country: z.string().length(2).default('ES'),
  phone: z.string().max(20).optional(),
  isDefault: z.boolean().default(false),
});
