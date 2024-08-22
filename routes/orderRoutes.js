import express from 'express'
import { client, permission, protect } from '../middleware/authMiddleware.js'
import order from '../controllers/orderController.js'
import { orderAddField, orderLinkAddField } from '../middleware/checkFields.js'

const router = express.Router()

// /api/order
router
  .route('/')
  .get(protect, permission(['client', 'supplier']), order.getOrders)
  .post(protect, client, orderAddField, order.addOrder)
router
  .route('/:id')
  .get(protect, permission(['client', 'supplier']), order.getOrder)
  .patch(protect, permission(['client', 'supplier']), order.editOrder)
  .delete(protect, client, order.deleteOrder)
router.post('/link/:user', orderLinkAddField, order.addOrderLink)

export default router
