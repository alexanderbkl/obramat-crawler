import { Router } from 'express';
import pool from '../db/connection.js';

const router = Router();

// GET /api/analytics/overview - Dashboard stats overview
router.get('/overview', async (req, res) => {
  try {
    // Total products
    const [totalProducts] = await pool.execute(
      `SELECT COUNT(*) as count FROM products`
    );

    // Price statistics
    const [priceStats] = await pool.execute(
      `SELECT 
        AVG(price) as avgPrice,
        MIN(price) as minPrice,
        MAX(price) as maxPrice,
        SUM(price) as totalValue
       FROM products WHERE price IS NOT NULL`
    );

    // Total stock
    const [stockStats] = await pool.execute(
      `SELECT 
        SUM(stock) as totalStock,
        AVG(stock) as avgStock
       FROM product_availability`
    );

    // Products added over time (last 30 days)
    const [recentProducts] = await pool.execute(
      `SELECT COUNT(*) as count FROM products 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
    );

    // Unique stores
    const [stores] = await pool.execute(
      `SELECT COUNT(DISTINCT store_name) as count FROM product_availability`
    );

    // Price changes count
    const [priceChanges] = await pool.execute(
      `SELECT COUNT(*) as count FROM product_price_history`
    );

    res.json({
      totalProducts: totalProducts[0].count,
      avgPrice: parseFloat(priceStats[0].avgPrice) || 0,
      minPrice: parseFloat(priceStats[0].minPrice) || 0,
      maxPrice: parseFloat(priceStats[0].maxPrice) || 0,
      totalInventoryValue: parseFloat(priceStats[0].totalValue) || 0,
      totalStock: parseInt(stockStats[0].totalStock) || 0,
      avgStock: parseFloat(stockStats[0].avgStock) || 0,
      productsLast30Days: recentProducts[0].count,
      uniqueStores: stores[0].count,
      totalPriceRecords: priceChanges[0].count
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
});

// GET /api/analytics/price-distribution - Price range distribution
router.get('/price-distribution', async (req, res) => {
  try {
    const [distribution] = await pool.execute(`
      SELECT 
        CASE 
          WHEN price <= 10 THEN '0-10€'
          WHEN price <= 25 THEN '10-25€'
          WHEN price <= 50 THEN '25-50€'
          WHEN price <= 100 THEN '50-100€'
          WHEN price <= 200 THEN '100-200€'
          ELSE '200€+'
        END as \`range\`,
        COUNT(*) as count,
        AVG(price) as avgPrice
      FROM products
      WHERE price IS NOT NULL
      GROUP BY 
        CASE 
          WHEN price <= 10 THEN '0-10€'
          WHEN price <= 25 THEN '10-25€'
          WHEN price <= 50 THEN '25-50€'
          WHEN price <= 100 THEN '50-100€'
          WHEN price <= 200 THEN '100-200€'
          ELSE '200€+'
        END
      ORDER BY MIN(price)
    `);

    res.json(distribution);
  } catch (error) {
    console.error('Error fetching price distribution:', error);
    res.status(500).json({ error: 'Failed to fetch price distribution' });
  }
});

// GET /api/analytics/stock-levels - Stock level distribution
router.get('/stock-levels', async (req, res) => {
  try {
    const [distribution] = await pool.execute(`
      SELECT 
        CASE 
          WHEN pa.stock = 0 THEN 'Out of Stock'
          WHEN pa.stock <= 5 THEN 'Low (1-5)'
          WHEN pa.stock <= 20 THEN 'Medium (6-20)'
          WHEN pa.stock <= 50 THEN 'Good (21-50)'
          ELSE 'High (50+)'
        END as level,
        COUNT(*) as count
      FROM product_availability pa
      GROUP BY 
        CASE 
          WHEN pa.stock = 0 THEN 'Out of Stock'
          WHEN pa.stock <= 5 THEN 'Low (1-5)'
          WHEN pa.stock <= 20 THEN 'Medium (6-20)'
          WHEN pa.stock <= 50 THEN 'Good (21-50)'
          ELSE 'High (50+)'
        END
      ORDER BY 
        CASE level
          WHEN 'Out of Stock' THEN 1
          WHEN 'Low (1-5)' THEN 2
          WHEN 'Medium (6-20)' THEN 3
          WHEN 'Good (21-50)' THEN 4
          ELSE 5
        END
    `);

    res.json(distribution);
  } catch (error) {
    console.error('Error fetching stock levels:', error);
    res.status(500).json({ error: 'Failed to fetch stock levels' });
  }
});

// GET /api/analytics/top-products - Top products by price or stock
router.get('/top-products', async (req, res) => {
  try {
    const metric = req.query.metric || 'price'; // price or stock
    const limit = parseInt(req.query.limit) || 10;

    let query;
    if (metric === 'stock') {
      query = `
        SELECT 
          p.id,
          p.title,
          p.price,
          pa.stock,
          (SELECT url FROM product_images WHERE product_id = p.id ORDER BY position LIMIT 1) as image_url
        FROM products p
        LEFT JOIN product_availability pa ON p.id = pa.product_id
        WHERE pa.stock IS NOT NULL
        ORDER BY pa.stock DESC
        LIMIT ?
      `;
    } else {
      query = `
        SELECT 
          p.id,
          p.title,
          p.price,
          (SELECT stock FROM product_availability WHERE product_id = p.id LIMIT 1) as stock,
          (SELECT url FROM product_images WHERE product_id = p.id ORDER BY position LIMIT 1) as image_url
        FROM products p
        WHERE p.price IS NOT NULL
        ORDER BY p.price DESC
        LIMIT ?
      `;
    }

    const [products] = await pool.execute(query, [String(limit)]);
    res.json(products);
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ error: 'Failed to fetch top products' });
  }
});

// GET /api/analytics/price-timeline - Global price tracking over time
router.get('/price-timeline', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const [timeline] = await pool.execute(`
      SELECT 
        DATE(recorded_at) as date,
        AVG(price) as avgPrice,
        MIN(price) as minPrice,
        MAX(price) as maxPrice,
        COUNT(*) as recordCount
      FROM product_price_history
      WHERE recorded_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(recorded_at)
      ORDER BY date ASC
    `, [days]);

    res.json(timeline);
  } catch (error) {
    console.error('Error fetching price timeline:', error);
    res.status(500).json({ error: 'Failed to fetch price timeline' });
  }
});

// GET /api/analytics/store-stock - Stock by store
router.get('/store-stock', async (req, res) => {
  try {
    const [storeData] = await pool.execute(`
      SELECT 
        store_name,
        store_city,
        SUM(stock) as totalStock,
        COUNT(*) as productCount,
        AVG(stock) as avgStock
      FROM product_availability
      GROUP BY store_name, store_city
      ORDER BY totalStock DESC
    `);

    res.json(storeData);
  } catch (error) {
    console.error('Error fetching store stock:', error);
    res.status(500).json({ error: 'Failed to fetch store stock' });
  }
});

// GET /api/analytics/low-stock - Products with low stock
router.get('/low-stock', async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;

    const [products] = await pool.execute(`
      SELECT 
        p.id,
        p.title,
        p.price,
        pa.stock,
        pa.store_name,
        (SELECT url FROM product_images WHERE product_id = p.id ORDER BY position LIMIT 1) as image_url
      FROM products p
      JOIN product_availability pa ON p.id = pa.product_id
      WHERE pa.stock <= ?
      ORDER BY pa.stock ASC
      LIMIT 20
    `, [threshold]);

    res.json(products);
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({ error: 'Failed to fetch low stock products' });
  }
});

export default router;
