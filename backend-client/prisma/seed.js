import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleaned existing data');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create test customer
  const customerPassword = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      password: customerPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'CUSTOMER',
    },
  });
  console.log('✅ Created customer user:', customer.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Latest gadgets and electronic devices',
        imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Clothing',
        slug: 'clothing',
        description: 'Fashion and apparel for all occasions',
        imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Home & Garden',
        slug: 'home-garden',
        description: 'Everything for your home and outdoor spaces',
        imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Sports & Outdoors',
        slug: 'sports-outdoors',
        description: 'Sports equipment and outdoor gear',
        imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400',
      },
    }),
  ]);
  console.log('✅ Created categories:', categories.length);

  // Create products
  const products = [
    // Electronics
    {
      name: 'Wireless Bluetooth Headphones',
      slug: 'wireless-bluetooth-headphones',
      description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and superior sound quality. Perfect for music lovers and professionals.',
      price: 149.99,
      comparePrice: 199.99,
      stock: 50,
      sku: 'ELEC-001',
      isActive: true,
      isFeatured: true,
      categoryId: categories[0].id,
      images: [
        { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', position: 0 },
        { url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600', position: 1 },
      ],
      variants: [
        { name: 'Color', value: 'Black', stock: 25 },
        { name: 'Color', value: 'White', stock: 15 },
        { name: 'Color', value: 'Blue', stock: 10 },
      ],
    },
    {
      name: 'Smart Watch Pro',
      slug: 'smart-watch-pro',
      description: 'Advanced smartwatch with health monitoring, GPS, water resistance, and 7-day battery life. Track your fitness goals in style.',
      price: 299.99,
      comparePrice: 349.99,
      stock: 30,
      sku: 'ELEC-002',
      isActive: true,
      isFeatured: true,
      categoryId: categories[0].id,
      images: [
        { url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600', position: 0 },
      ],
      variants: [
        { name: 'Size', value: '40mm', stock: 15 },
        { name: 'Size', value: '44mm', stock: 15 },
      ],
    },
    {
      name: 'Portable Power Bank 20000mAh',
      slug: 'portable-power-bank-20000mah',
      description: 'High-capacity power bank with fast charging support. Charge multiple devices simultaneously with USB-C and USB-A ports.',
      price: 49.99,
      stock: 100,
      sku: 'ELEC-003',
      isActive: true,
      isFeatured: false,
      categoryId: categories[0].id,
      images: [
        { url: 'https://images.unsplash.com/photo-1609592106275-8d3e0f6e2c3e?w=600', position: 0 },
      ],
      variants: [],
    },
    {
      name: 'Wireless Charging Pad',
      slug: 'wireless-charging-pad',
      description: 'Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicator.',
      price: 29.99,
      comparePrice: 39.99,
      stock: 75,
      sku: 'ELEC-004',
      isActive: true,
      isFeatured: false,
      categoryId: categories[0].id,
      images: [
        { url: 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e5?w=600', position: 0 },
      ],
      variants: [],
    },
    {
      name: 'Mechanical Gaming Keyboard',
      slug: 'mechanical-gaming-keyboard',
      description: 'RGB mechanical keyboard with hot-swappable switches, programmable keys, and durable construction for gaming enthusiasts.',
      price: 89.99,
      stock: 40,
      sku: 'ELEC-005',
      isActive: true,
      isFeatured: true,
      categoryId: categories[0].id,
      images: [
        { url: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600', position: 0 },
      ],
      variants: [
        { name: 'Switch Type', value: 'Red', stock: 20 },
        { name: 'Switch Type', value: 'Blue', stock: 20 },
      ],
    },

    // Clothing
    {
      name: 'Classic Denim Jacket',
      slug: 'classic-denim-jacket',
      description: 'Timeless denim jacket with a comfortable fit. Perfect for layering in any season. Made from premium cotton denim.',
      price: 79.99,
      comparePrice: 99.99,
      stock: 60,
      sku: 'CLOTH-001',
      isActive: true,
      isFeatured: true,
      categoryId: categories[1].id,
      images: [
        { url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600', position: 0 },
      ],
      variants: [
        { name: 'Size', value: 'S', stock: 15 },
        { name: 'Size', value: 'M', stock: 20 },
        { name: 'Size', value: 'L', stock: 15 },
        { name: 'Size', value: 'XL', stock: 10 },
      ],
    },
    {
      name: 'Premium Cotton T-Shirt',
      slug: 'premium-cotton-tshirt',
      description: 'Soft and breathable 100% organic cotton t-shirt. Available in multiple colors. Perfect for everyday wear.',
      price: 24.99,
      stock: 200,
      sku: 'CLOTH-002',
      isActive: true,
      isFeatured: false,
      categoryId: categories[1].id,
      images: [
        { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', position: 0 },
      ],
      variants: [
        { name: 'Color', value: 'White', stock: 50 },
        { name: 'Color', value: 'Black', stock: 50 },
        { name: 'Color', value: 'Navy', stock: 50 },
        { name: 'Color', value: 'Gray', stock: 50 },
      ],
    },
    {
      name: 'Running Sneakers',
      slug: 'running-sneakers',
      description: 'Lightweight running shoes with responsive cushioning and breathable mesh upper. Perfect for daily runs and workouts.',
      price: 119.99,
      comparePrice: 149.99,
      stock: 45,
      sku: 'CLOTH-003',
      isActive: true,
      isFeatured: true,
      categoryId: categories[1].id,
      images: [
        { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', position: 0 },
        { url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600', position: 1 },
      ],
      variants: [
        { name: 'Size', value: '8', stock: 10 },
        { name: 'Size', value: '9', stock: 15 },
        { name: 'Size', value: '10', stock: 10 },
        { name: 'Size', value: '11', stock: 10 },
      ],
    },

    // Home & Garden
    {
      name: 'Minimalist Desk Lamp',
      slug: 'minimalist-desk-lamp',
      description: 'Modern LED desk lamp with adjustable brightness and color temperature. USB charging port included. Perfect for home office.',
      price: 59.99,
      stock: 35,
      sku: 'HOME-001',
      isActive: true,
      isFeatured: true,
      categoryId: categories[2].id,
      images: [
        { url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600', position: 0 },
      ],
      variants: [
        { name: 'Color', value: 'White', stock: 20 },
        { name: 'Color', value: 'Black', stock: 15 },
      ],
    },
    {
      name: 'Indoor Plant Pot Set',
      slug: 'indoor-plant-pot-set',
      description: 'Set of 3 ceramic plant pots with bamboo saucers. Modern design perfect for succulents and small plants.',
      price: 34.99,
      stock: 80,
      sku: 'HOME-002',
      isActive: true,
      isFeatured: false,
      categoryId: categories[2].id,
      images: [
        { url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600', position: 0 },
      ],
      variants: [],
    },
    {
      name: 'Cozy Throw Blanket',
      slug: 'cozy-throw-blanket',
      description: 'Ultra-soft fleece throw blanket. Perfect for movie nights and chilly evenings. Machine washable.',
      price: 44.99,
      comparePrice: 59.99,
      stock: 55,
      sku: 'HOME-003',
      isActive: true,
      isFeatured: false,
      categoryId: categories[2].id,
      images: [
        { url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600', position: 0 },
      ],
      variants: [
        { name: 'Color', value: 'Beige', stock: 20 },
        { name: 'Color', value: 'Gray', stock: 20 },
        { name: 'Color', value: 'Navy', stock: 15 },
      ],
    },
    {
      name: 'Aromatherapy Diffuser',
      slug: 'aromatherapy-diffuser',
      description: 'Ultrasonic essential oil diffuser with ambient lighting. 300ml capacity with auto shut-off feature.',
      price: 39.99,
      stock: 65,
      sku: 'HOME-004',
      isActive: true,
      isFeatured: true,
      categoryId: categories[2].id,
      images: [
        { url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600', position: 0 },
      ],
      variants: [],
    },

    // Sports & Outdoors
    {
      name: 'Yoga Mat Premium',
      slug: 'yoga-mat-premium',
      description: 'Extra-thick eco-friendly yoga mat with alignment lines. Non-slip surface and carrying strap included.',
      price: 49.99,
      stock: 70,
      sku: 'SPORT-001',
      isActive: true,
      isFeatured: true,
      categoryId: categories[3].id,
      images: [
        { url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600', position: 0 },
      ],
      variants: [
        { name: 'Color', value: 'Purple', stock: 25 },
        { name: 'Color', value: 'Blue', stock: 25 },
        { name: 'Color', value: 'Gray', stock: 20 },
      ],
    },
    {
      name: 'Resistance Bands Set',
      slug: 'resistance-bands-set',
      description: 'Complete set of 5 resistance bands with different tension levels. Perfect for home workouts and physical therapy.',
      price: 24.99,
      stock: 120,
      sku: 'SPORT-002',
      isActive: true,
      isFeatured: false,
      categoryId: categories[3].id,
      images: [
        { url: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600', position: 0 },
      ],
      variants: [],
    },
    {
      name: 'Insulated Water Bottle',
      slug: 'insulated-water-bottle',
      description: 'Double-wall vacuum insulated stainless steel water bottle. Keeps drinks cold for 24 hours or hot for 12 hours.',
      price: 29.99,
      stock: 90,
      sku: 'SPORT-003',
      isActive: true,
      isFeatured: false,
      categoryId: categories[3].id,
      images: [
        { url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600', position: 0 },
      ],
      variants: [
        { name: 'Size', value: '500ml', stock: 45 },
        { name: 'Size', value: '750ml', stock: 45 },
      ],
    },
    {
      name: 'Camping Hammock',
      slug: 'camping-hammock',
      description: 'Lightweight portable hammock with tree straps. Supports up to 500lbs. Perfect for camping, hiking, and backyard relaxation.',
      price: 39.99,
      comparePrice: 54.99,
      stock: 40,
      sku: 'SPORT-004',
      isActive: true,
      isFeatured: true,
      categoryId: categories[3].id,
      images: [
        { url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600', position: 0 },
      ],
      variants: [
        { name: 'Color', value: 'Green', stock: 20 },
        { name: 'Color', value: 'Orange', stock: 20 },
      ],
    },
  ];

  for (const productData of products) {
    const { images, variants, ...product } = productData;
    const createdProduct = await prisma.product.create({
      data: {
        ...product,
        images: {
          create: images,
        },
        variants: {
          create: variants,
        },
      },
    });
    console.log(`  ✅ Created product: ${createdProduct.name}`);
  }

  console.log('✅ Created products:', products.length);

  // Create sample address for customer
  await prisma.address.create({
    data: {
      userId: customer.id,
      firstName: 'John',
      lastName: 'Doe',
      street: '123 Main Street',
      city: 'Barcelona',
      state: 'Catalonia',
      postalCode: '08001',
      country: 'ES',
      phone: '+34 612 345 678',
      isDefault: true,
    },
  });
  console.log('✅ Created sample address');

  // Create sample reviews
  const allProducts = await prisma.product.findMany({ take: 5 });
  for (const product of allProducts) {
    await prisma.review.create({
      data: {
        userId: customer.id,
        productId: product.id,
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
        title: 'Great product!',
        comment: 'Really happy with this purchase. Quality is excellent and delivery was fast.',
      },
    });
  }
  console.log('✅ Created sample reviews');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\nTest accounts:');
  console.log('  Admin: admin@example.com / admin123');
  console.log('  Customer: customer@example.com / customer123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
