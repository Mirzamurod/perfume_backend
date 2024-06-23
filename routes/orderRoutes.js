import express from 'express'
import { client, protect } from '../middleware/authMiddleware.js'
import order from '../controllers/orderController.js'
import { orderAddField } from '../middleware/checkFields.js'

const router = express.Router()

// /api/order
router
  .route('/')
  .get(protect, client, order.getOrders)
  .post(protect, client, orderAddField, order.addOrder)
router
  .route('/:id')
  .get(protect, client, order.getOrder)
  .put(protect, client, orderAddField, order.editOrder)
  .delete(protect, client, order.deleteOrder)

export default router
