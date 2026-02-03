import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce API',
      version: '1.0.0',
      description: 'E-commerce backend API with JWT authentication, products, cart, and orders',
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        CreateProduct: {
          type: 'object',
          required: ['name', 'price', 'categoryId'],
          properties: {
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            comparePrice: { type: 'number' },
            sku: { type: 'string' },
            stock: { type: 'integer' },
            isActive: { type: 'boolean' },
            isFeatured: { type: 'boolean' },
            categoryId: { type: 'string', format: 'uuid' },
            images: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: { type: 'string' },
                  alt: { type: 'string' },
                  position: { type: 'integer' },
                },
              },
            },
            variants: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  value: { type: 'string' },
                  price: { type: 'number' },
                  stock: { type: 'integer' },
                  sku: { type: 'string' },
                },
              },
            },
          },
        },
        UpdateProduct: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            comparePrice: { type: 'number' },
            stock: { type: 'integer' },
            isActive: { type: 'boolean' },
            isFeatured: { type: 'boolean' },
          },
        },
        Address: {
          type: 'object',
          required: ['firstName', 'lastName', 'street', 'city', 'postalCode'],
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            street: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            postalCode: { type: 'string' },
            country: { type: 'string' },
            phone: { type: 'string' },
            isDefault: { type: 'boolean' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Products', description: 'Product management' },
      { name: 'Cart', description: 'Shopping cart' },
      { name: 'Orders', description: 'Order management' },
      { name: 'Addresses', description: 'User addresses' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
