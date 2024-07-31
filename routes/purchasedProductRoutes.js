import express from 'express'
import { client, protect } from '../middleware/authMiddleware.js'
import purchasedProduct from '../controllers/purchasedProductController.js'
import { purchasedProductAddField } from '../middleware/checkFields.js'

const router = express.Router()

// /api/purchased-product
router
  .route('/')
  .get(protect, client, purchasedProduct.getPurchasedProducts)
  .post(protect, client, purchasedProductAddField, purchasedProduct.addPurchasedProduct)
router
  .route('/:id')
  .get(protect, client, purchasedProduct.getPurchasedProduct)
  .put(protect, client, purchasedProductAddField, purchasedProduct.editPurchasedProduct)
  .delete(protect, client, purchasedProduct.deletePurchasedProduct)

export default router
