import express from 'express'
import { client, protect } from '../middleware/authMiddleware.js'
import productGroup from '../controllers/productGroupController.js'

const router = express.Router()

// /api/product-group
router.route('/').get(protect, client, productGroup.getProductsGroup)
router.route('/:id').get(protect, client, productGroup.getProductGroup)
router.route('/order/:user').get(productGroup.getProductGroupOrder)

export default router
