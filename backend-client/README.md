# E-Commerce Backend API

Production-ready e-commerce backend with JWT authentication, product management, cart, and orders.

## Tech Stack

- **Node.js** with Express.js
- **Prisma ORM** with MySQL
- **JWT** for authentication
- **Zod** for validation
- **Swagger** for API documentation
- **Docker** for containerization

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8.0+ or Docker

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment file and configure:
```bash
cp .env.example .env
```

3. Generate Prisma client:
```bash
npm run db:generate
```

4. Push database schema:
```bash
npm run db:push
```

5. Seed the database:
```bash
npm run db:seed
```

6. Start the server:
```bash
npm run dev
```

### Using Docker

```bash
docker-compose up -d
```

Then run migrations:
```bash
docker-compose exec backend npx prisma db push
docker-compose exec backend npm run db:seed
```

## API Documentation

Once running, visit `http://localhost:3002/api/docs` for Swagger documentation.

## Test Accounts

After seeding:
- **Admin**: admin@example.com / admin123
- **Customer**: customer@example.com / customer123

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - List products (with filters)
- `GET /api/products/featured` - Featured products
- `GET /api/products/categories` - All categories
- `GET /api/products/:id` - Product details
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart` - Add to cart
- `POST /api/cart/merge` - Merge local cart
- `PUT /api/cart/:id` - Update quantity
- `DELETE /api/cart/:id` - Remove item
- `DELETE /api/cart` - Clear cart

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Order details
- `POST /api/orders/:id/checkout` - Create Stripe session

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3002 |
| DATABASE_URL | MySQL connection string | - |
| JWT_SECRET | Access token secret | - |
| JWT_REFRESH_SECRET | Refresh token secret | - |
| CORS_ORIGIN | Allowed CORS origin | http://localhost:5174 |
| STRIPE_SECRET_KEY | Stripe API key | - |

## License

MIT
