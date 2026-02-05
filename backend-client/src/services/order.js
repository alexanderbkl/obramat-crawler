import prisma from '../db/prisma.js';
import { v4 as uuidv4 } from 'uuid';

const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = uuidv4().split('-')[0].toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

const SHIPPING_RATE = 5.99; // Flat rate shipping
const FREE_SHIPPING_THRESHOLD = 50; // Free shipping for orders over €50
const TAX_RATE = 0.21; // 21% VAT for Spain

export const orderService = {
  async createOrder(userId, { addressId, address, notes }) {
    // Get user's cart
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true,
      },
    });

    if (cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    // Validate stock for all items
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${item.product.name}. Only ${item.product.stock} available.`
        );
      }
    }

    // Handle address
    let finalAddressId = addressId;
    
    if (!addressId && address) {
      // Create new address
      const newAddress = await prisma.address.create({
        data: {
          ...address,
          userId,
        },
      });
      finalAddressId = newAddress.id;
    } else if (!addressId) {
      // Try to use default address
      const defaultAddress = await prisma.address.findFirst({
        where: { userId, isDefault: true },
      });
      
      if (defaultAddress) {
        finalAddressId = defaultAddress.id;
      }
    }

    // Calculate totals
    const subtotal = cartItems.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );
    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATE;
    const tax = subtotal * TAX_RATE;
    const total = subtotal + shippingCost + tax;

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          addressId: finalAddressId,
          status: 'PENDING',
          subtotal,
          shippingCost,
          tax,
          total,
          notes,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              name: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
              variantInfo: item.variantId || null,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    take: 1,
                    orderBy: { position: 'asc' },
                  },
                },
              },
            },
          },
          address: true,
        },
      });

      // Update product stock
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { userId },
      });

      return newOrder;
    });

    return order;
  },

  async getOrders(userId, { page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    take: 1,
                    orderBy: { position: 'asc' },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    // Format orders
    const formattedOrders = orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        ...item,
        imageUrl: item.product.images[0]?.url || null,
        product: undefined,
      })),
    }));

    return {
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getOrderById(orderId, userId = null) {
    const where = { id: orderId };
    if (userId) {
      where.userId = userId;
    }

    const order = await prisma.order.findFirst({
      where,
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  take: 1,
                  orderBy: { position: 'asc' },
                },
              },
            },
          },
        },
        address: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!order) {
      return null;
    }

    // Format order
    return {
      ...order,
      items: order.items.map((item) => ({
        ...item,
        imageUrl: item.product.images[0]?.url || null,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
        },
      })),
    };
  },

  async getOrderByNumber(orderNumber, userId = null) {
    const where = { orderNumber };
    if (userId) {
      where.userId = userId;
    }

    const order = await prisma.order.findFirst({
      where,
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  take: 1,
                  orderBy: { position: 'asc' },
                },
              },
            },
          },
        },
        address: true,
      },
    });

    if (!order) {
      return null;
    }

    return {
      ...order,
      items: order.items.map((item) => ({
        ...item,
        imageUrl: item.product.images[0]?.url || null,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
        },
      })),
    };
  },

  async updateOrderStatus(orderId, status) {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return order;
  },

  async createStripeCheckoutSession(orderId) {
    // Stub for Stripe integration
    // In production, this would create a Stripe Checkout session
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Return stub checkout URL
    const checkoutUrl = `https://checkout.stripe.com/stub/${order.orderNumber}`;
    const sessionId = `sess_${order.orderNumber}`;

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: orderId },
      data: { stripeSessionId: sessionId },
    });

    return {
      checkoutUrl,
      sessionId,
    };
  },

  async getUserAddresses(userId) {
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return addresses;
  },

  async createAddress(userId, data) {
    // If this is set as default, unset other defaults
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        ...data,
        userId,
      },
    });

    return address;
  },

  async updateAddress(addressId, userId, data) {
    // Verify ownership
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existing) {
      throw new Error('Address not found');
    }

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true, NOT: { id: addressId } },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id: addressId },
      data,
    });

    return address;
  },

  async deleteAddress(addressId, userId) {
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existing) {
      throw new Error('Address not found');
    }

    await prisma.address.delete({
      where: { id: addressId },
    });
  },
};
