import express from 'express'
import { client, protect } from '../middleware/authMiddleware.js'
import product from '../controllers/productController.js'
import { productAddField } from '../middleware/checkFields.js'

const router = express.Router()

// /api/product
router
  .route('/')
  .get(protect, client, product.getProducts)
  .post(protect, client, productAddField, product.addProduct)
router
  .route('/:id')
  .get(protect, client, product.getProduct)
  .put(protect, client, productAddField, product.editProduct)
  .delete(protect, client, product.deleteProduct)

export default router
