import prisma from '../db/prisma.js';

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export const productService = {
  async getProducts(query) {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      minPrice,
      maxPrice,
      minRating,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isFeatured,
      isActive,
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    } else {
      where.isActive = true; // Default to only active products
    }

    // Build orderBy
    const orderBy = {};
    if (sortBy === 'rating') {
      // For rating, we need to do something special
      orderBy.createdAt = sortOrder;
    } else {
      orderBy[sortBy] = sortOrder;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            orderBy: { position: 'asc' },
            take: 1,
          },
          reviews: {
            select: { rating: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Calculate average rating for each product
    const productsWithRating = products.map((product) => {
      const ratings = product.reviews;
      const avgRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : null;
      
      return {
        ...product,
        averageRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        reviewCount: ratings.length,
        reviews: undefined, // Remove raw reviews
        imageUrl: product.images[0]?.url || null,
        images: undefined, // Remove images array, just use imageUrl
      };
    });

    // Filter by rating if specified
    let filteredProducts = productsWithRating;
    if (minRating !== undefined) {
      filteredProducts = productsWithRating.filter(
        (p) => p.averageRating && p.averageRating >= minRating
      );
    }

    return {
      products: filteredProducts,
      pagination: {
        page,
        limit,
        total: minRating !== undefined ? filteredProducts.length : total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getProductById(id) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          orderBy: { position: 'asc' },
        },
        variants: true,
        reviews: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      return null;
    }

    // Calculate average rating
    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : null;

    return {
      ...product,
      averageRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
      reviewCount: product.reviews.length,
    };
  },

  async getProductBySlug(slug) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          orderBy: { position: 'asc' },
        },
        variants: true,
        reviews: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      return null;
    }

    // Calculate average rating
    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : null;

    return {
      ...product,
      averageRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
      reviewCount: product.reviews.length,
    };
  },

  async createProduct(data) {
    const { images, variants, ...productData } = data;

    // Generate slug if not provided
    if (!productData.slug) {
      productData.slug = generateSlug(productData.name);
      
      // Check for uniqueness and append number if needed
      let slugExists = await prisma.product.findUnique({
        where: { slug: productData.slug },
      });
      
      let counter = 1;
      while (slugExists) {
        productData.slug = `${generateSlug(productData.name)}-${counter}`;
        slugExists = await prisma.product.findUnique({
          where: { slug: productData.slug },
        });
        counter++;
      }
    }

    const product = await prisma.product.create({
      data: {
        ...productData,
        images: images ? { create: images } : undefined,
        variants: variants ? { create: variants } : undefined,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          orderBy: { position: 'asc' },
        },
        variants: true,
      },
    });

    return product;
  },

  async updateProduct(id, data) {
    const { images, variants, ...productData } = data;

    // Handle images update
    if (images) {
      await prisma.productImage.deleteMany({
        where: { productId: id },
      });
    }

    // Handle variants update
    if (variants) {
      await prisma.productVariant.deleteMany({
        where: { productId: id },
      });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...productData,
        images: images ? { create: images } : undefined,
        variants: variants ? { create: variants } : undefined,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          orderBy: { position: 'asc' },
        },
        variants: true,
      },
    });

    return product;
  },

  async deleteProduct(id) {
    await prisma.product.delete({
      where: { id },
    });
  },

  async getCategories() {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });

    return categories.map((cat) => ({
      ...cat,
      productCount: cat._count.products,
      _count: undefined,
    }));
  },

  async getCategoryBySlug(slug) {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
    });

    if (!category) {
      return null;
    }

    return {
      ...category,
      productCount: category._count.products,
      _count: undefined,
    };
  },

  async getFeaturedProducts(limit = 8) {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          orderBy: { position: 'asc' },
          take: 1,
        },
        reviews: {
          select: { rating: true },
        },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return products.map((product) => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : null;

      return {
        ...product,
        averageRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        reviewCount: product.reviews.length,
        reviews: undefined,
        imageUrl: product.images[0]?.url || null,
        images: undefined,
      };
    });
  },
};
