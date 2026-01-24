import { Router } from 'express';
import pool from '../db/connection.js';

const router = Router();

// GET /api/products - List products with pagination, search, and filters
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'updated_at';
    const sortOrder = req.query.sortOrder === 'asc' ? 'ASC' : 'DESC';
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;

    let whereClause = '1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (p.title LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (minPrice !== null) {
      whereClause += ' AND p.price >= ?';
      params.push(minPrice);
    }

    if (maxPrice !== null) {
      whereClause += ' AND p.price <= ?';
      params.push(maxPrice);
    }

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM products p WHERE ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Get products with first image
    const allowedSortColumns = ['price', 'title', 'created_at', 'updated_at'];
    const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'updated_at';

    const [products] = await pool.execute(
      `SELECT 
        p.id,
        p.title,
        p.price,
        p.currency,
        p.created_at,
        p.updated_at,
        (SELECT url FROM product_images WHERE product_id = p.id ORDER BY position LIMIT 1) as image_url,
        (SELECT stock FROM product_availability WHERE product_id = p.id LIMIT 1) as current_stock,
        (SELECT store_name FROM product_availability WHERE product_id = p.id LIMIT 1) as store_name
      FROM products p
      WHERE ${whereClause}
      ORDER BY p.${sortColumn} ${sortOrder}
      LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    res.json({
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:id - Get single product with all details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get product
    const [products] = await pool.execute(
      `SELECT * FROM products WHERE id = ?`,
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = products[0];

    // Get images
    const [images] = await pool.execute(
      `SELECT id, url, position FROM product_images WHERE product_id = ? ORDER BY position`,
      [id]
    );

    // Get documents
    const [documents] = await pool.execute(
      `SELECT id, url FROM product_documents WHERE product_id = ?`,
      [id]
    );

    // Get current availability
    const [availability] = await pool.execute(
      `SELECT id, store_city, store_name, availability_text, stock 
       FROM product_availability WHERE product_id = ?`,
      [id]
    );

    res.json({
      ...product,
      images,
      documents,
      availability
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// GET /api/products/:id/price-history - Get price history for a product
router.get('/:id/price-history', async (req, res) => {
  try {
    const { id } = req.params;
    const days = parseInt(req.query.days) || 90;

    const [history] = await pool.execute(
      `SELECT id, price, price_text, currency, recorded_at
       FROM product_price_history 
       WHERE product_id = ? AND recorded_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       ORDER BY recorded_at ASC`,
      [id, days]
    );

    res.json(history);
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({ error: 'Failed to fetch price history' });
  }
});

// GET /api/products/:id/stock-history - Get stock/availability history for a product
router.get('/:id/stock-history', async (req, res) => {
  try {
    const { id } = req.params;
    const days = parseInt(req.query.days) || 90;

    const [history] = await pool.execute(
      `SELECT id, store_city, store_name, availability_text, stock, recorded_at
       FROM product_availability_history 
       WHERE product_id = ? AND recorded_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       ORDER BY recorded_at ASC`,
      [id, days]
    );

    res.json(history);
  } catch (error) {
    console.error('Error fetching stock history:', error);
    res.status(500).json({ error: 'Failed to fetch stock history' });
  }
});

export default router;
