import { cartService } from '../services/cart.js';
import { successResponse, errorResponse, HTTP_STATUS } from '../utils/response.js';

export const cartController = {
  async getCart(req, res) {
    try {
      const cart = await cartService.getCart(req.user.id);
      
      res.json(
        successResponse(cart)
      );
    } catch (error) {
      console.error('Get cart error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to fetch cart')
      );
    }
  },

  async addToCart(req, res) {
    try {
      const cart = await cartService.addToCart(req.user.id, req.body);
      
      res.json(
        successResponse(cart, 'Item added to cart')
      );
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          errorResponse(error.message)
        );
      }
      
      if (error.message.includes('stock')) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          errorResponse(error.message)
        );
      }
      
      console.error('Add to cart error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to add item to cart')
      );
    }
  },

  async updateCartItem(req, res) {
    try {
      const cart = await cartService.updateCartItem(
        req.user.id,
        req.params.id,
        req.body.quantity
      );
      
      res.json(
        successResponse(cart, 'Cart updated')
      );
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          errorResponse(error.message)
        );
      }
      
      if (error.message.includes('stock')) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          errorResponse(error.message)
        );
      }
      
      console.error('Update cart item error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to update cart')
      );
    }
  },

  async removeFromCart(req, res) {
    try {
      const cart = await cartService.removeFromCart(req.user.id, req.params.id);
      
      res.json(
        successResponse(cart, 'Item removed from cart')
      );
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          errorResponse(error.message)
        );
      }
      
      console.error('Remove from cart error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to remove item from cart')
      );
    }
  },

  async clearCart(req, res) {
    try {
      const cart = await cartService.clearCart(req.user.id);
      
      res.json(
        successResponse(cart, 'Cart cleared')
      );
    } catch (error) {
      console.error('Clear cart error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to clear cart')
      );
    }
  },

  async mergeCart(req, res) {
    try {
      const cart = await cartService.mergeCart(req.user.id, req.body.items);
      
      res.json(
        successResponse(cart, 'Cart merged')
      );
    } catch (error) {
      console.error('Merge cart error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to merge cart')
      );
    }
  },
};
