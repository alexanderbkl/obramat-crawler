import { productService } from '../services/product.js';
import { successResponse, errorResponse, paginatedResponse, HTTP_STATUS } from '../utils/response.js';

export const productController = {
  async getProducts(req, res) {
    try {
      const { products, pagination } = await productService.getProducts(req.query);
      
      res.json(
        paginatedResponse(products, pagination)
      );
    } catch (error) {
      console.error('Get products error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to fetch products')
      );
    }
  },

  async getProductById(req, res) {
    try {
      const product = await productService.getProductById(req.params.id);
      
      if (!product) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          errorResponse('Product not found')
        );
      }
      
      res.json(
        successResponse(product)
      );
    } catch (error) {
      console.error('Get product error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to fetch product')
      );
    }
  },

  async getProductBySlug(req, res) {
    try {
      const product = await productService.getProductBySlug(req.params.slug);
      
      if (!product) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          errorResponse('Product not found')
        );
      }
      
      res.json(
        successResponse(product)
      );
    } catch (error) {
      console.error('Get product by slug error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to fetch product')
      );
    }
  },

  async createProduct(req, res) {
    try {
      const product = await productService.createProduct(req.body);
      
      res.status(HTTP_STATUS.CREATED).json(
        successResponse(product, 'Product created')
      );
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(HTTP_STATUS.CONFLICT).json(
          errorResponse('Product with this slug or SKU already exists')
        );
      }
      
      console.error('Create product error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to create product')
      );
    }
  },

  async updateProduct(req, res) {
    try {
      const product = await productService.updateProduct(req.params.id, req.body);
      
      res.json(
        successResponse(product, 'Product updated')
      );
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          errorResponse('Product not found')
        );
      }
      
      console.error('Update product error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to update product')
      );
    }
  },

  async deleteProduct(req, res) {
    try {
      await productService.deleteProduct(req.params.id);
      
      res.json(
        successResponse(null, 'Product deleted')
      );
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          errorResponse('Product not found')
        );
      }
      
      console.error('Delete product error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to delete product')
      );
    }
  },

  async getCategories(req, res) {
    try {
      const categories = await productService.getCategories();
      
      res.json(
        successResponse(categories)
      );
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to fetch categories')
      );
    }
  },

  async getCategoryBySlug(req, res) {
    try {
      const category = await productService.getCategoryBySlug(req.params.slug);
      
      if (!category) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          errorResponse('Category not found')
        );
      }
      
      res.json(
        successResponse(category)
      );
    } catch (error) {
      console.error('Get category error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to fetch category')
      );
    }
  },

  async getFeaturedProducts(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 8;
      const products = await productService.getFeaturedProducts(limit);
      
      res.json(
        successResponse(products)
      );
    } catch (error) {
      console.error('Get featured products error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to fetch featured products')
      );
    }
  },
};
