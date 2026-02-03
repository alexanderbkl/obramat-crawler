import { orderService } from '../services/order.js';
import { successResponse, errorResponse, paginatedResponse, HTTP_STATUS } from '../utils/response.js';

export const orderController = {
  async createOrder(req, res) {
    try {
      const order = await orderService.createOrder(req.user.id, req.body);
      
      res.status(HTTP_STATUS.CREATED).json(
        successResponse(order, 'Order created successfully')
      );
    } catch (error) {
      if (error.message === 'Cart is empty') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          errorResponse(error.message)
        );
      }
      
      if (error.message.includes('Insufficient stock')) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          errorResponse(error.message)
        );
      }
      
      console.error('Create order error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to create order')
      );
    }
  },

  async getOrders(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const { orders, pagination } = await orderService.getOrders(
        req.user.id,
        { page, limit }
      );
      
      res.json(
        paginatedResponse(orders, pagination)
      );
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to fetch orders')
      );
    }
  },

  async getOrderById(req, res) {
    try {
      const order = await orderService.getOrderById(req.params.id, req.user.id);
      
      if (!order) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          errorResponse('Order not found')
        );
      }
      
      res.json(
        successResponse(order)
      );
    } catch (error) {
      console.error('Get order error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to fetch order')
      );
    }
  },

  async getOrderByNumber(req, res) {
    try {
      const order = await orderService.getOrderByNumber(
        req.params.orderNumber,
        req.user.id
      );
      
      if (!order) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          errorResponse('Order not found')
        );
      }
      
      res.json(
        successResponse(order)
      );
    } catch (error) {
      console.error('Get order by number error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to fetch order')
      );
    }
  },

  async createCheckoutSession(req, res) {
    try {
      const order = await orderService.getOrderById(req.params.id, req.user.id);
      
      if (!order) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          errorResponse('Order not found')
        );
      }
      
      if (order.status !== 'PENDING') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          errorResponse('Order is not pending payment')
        );
      }
      
      const { checkoutUrl, sessionId } = await orderService.createStripeCheckoutSession(
        order.id
      );
      
      res.json(
        successResponse({ checkoutUrl, sessionId }, 'Checkout session created')
      );
    } catch (error) {
      console.error('Create checkout session error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to create checkout session')
      );
    }
  },

  // Address endpoints
  async getAddresses(req, res) {
    try {
      const addresses = await orderService.getUserAddresses(req.user.id);
      
      res.json(
        successResponse(addresses)
      );
    } catch (error) {
      console.error('Get addresses error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to fetch addresses')
      );
    }
  },

  async createAddress(req, res) {
    try {
      const address = await orderService.createAddress(req.user.id, req.body);
      
      res.status(HTTP_STATUS.CREATED).json(
        successResponse(address, 'Address created')
      );
    } catch (error) {
      console.error('Create address error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to create address')
      );
    }
  },

  async updateAddress(req, res) {
    try {
      const address = await orderService.updateAddress(
        req.params.id,
        req.user.id,
        req.body
      );
      
      res.json(
        successResponse(address, 'Address updated')
      );
    } catch (error) {
      if (error.message === 'Address not found') {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          errorResponse(error.message)
        );
      }
      
      console.error('Update address error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to update address')
      );
    }
  },

  async deleteAddress(req, res) {
    try {
      await orderService.deleteAddress(req.params.id, req.user.id);
      
      res.json(
        successResponse(null, 'Address deleted')
      );
    } catch (error) {
      if (error.message === 'Address not found') {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          errorResponse(error.message)
        );
      }
      
      console.error('Delete address error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to delete address')
      );
    }
  },
};
