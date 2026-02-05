import prisma from '../db/prisma.js';

export const cartService = {
  async getCart(userId) {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: {
              orderBy: { position: 'asc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate totals and format response
    let subtotal = 0;
    const items = cartItems.map((item) => {
      const itemTotal = Number(item.product.price) * item.quantity;
      subtotal += itemTotal;

      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          price: item.product.price,
          comparePrice: item.product.comparePrice,
          currency: item.product.currency,
          stock: item.product.stock,
          imageUrl: item.product.images[0]?.url || null,
        },
        itemTotal,
      };
    });

    return {
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      currency: 'EUR',
    };
  },

  async addToCart(userId, { productId, quantity, variantId }) {
    // Check product exists and has stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    if (!product.isActive) {
      throw new Error('Product is not available');
    }

    if (product.stock < quantity) {
      throw new Error(`Only ${product.stock} items available in stock`);
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId_variantId: {
          userId,
          productId,
          variantId: variantId || null,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      
      if (product.stock < newQuantity) {
        throw new Error(`Cannot add more. Only ${product.stock} items available in stock`);
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity,
          variantId: variantId || null,
        },
      });
    }

    return this.getCart(userId);
  },

  async updateCartItem(userId, itemId, quantity) {
    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, userId },
      include: { product: true },
    });

    if (!item) {
      throw new Error('Cart item not found');
    }

    if (item.product.stock < quantity) {
      throw new Error(`Only ${item.product.stock} items available in stock`);
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return this.getCart(userId);
  },

  async removeFromCart(userId, itemId) {
    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, userId },
    });

    if (!item) {
      throw new Error('Cart item not found');
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return this.getCart(userId);
  },

  async clearCart(userId) {
    await prisma.cartItem.deleteMany({
      where: { userId },
    });

    return { items: [], itemCount: 0, subtotal: 0, currency: 'EUR' };
  },

  async mergeCart(userId, localItems) {
    // Merge local cart items with user's cart
    for (const item of localItems) {
      try {
        // Check product exists and is active
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || !product.isActive) {
          continue;
        }

        const existingItem = await prisma.cartItem.findUnique({
          where: {
            userId_productId_variantId: {
              userId,
              productId: item.productId,
              variantId: item.variantId || null,
            },
          },
        });

        if (existingItem) {
          // Add quantities but respect stock limit
          const newQuantity = Math.min(
            existingItem.quantity + item.quantity,
            product.stock
          );

          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: newQuantity },
          });
        } else {
          // Add new item but respect stock limit
          const quantity = Math.min(item.quantity, product.stock);

          if (quantity > 0) {
            await prisma.cartItem.create({
              data: {
                userId,
                productId: item.productId,
                quantity,
                variantId: item.variantId || null,
              },
            });
          }
        }
      } catch (error) {
        // Continue with next item if one fails
        console.error('Error merging cart item:', error);
      }
    }

    return this.getCart(userId);
  },
};
