import express from 'express'
import { client, protect } from '../middleware/authMiddleware.js'
import perfume from '../controllers/perfumeController.js'
import { perfumeAddField } from '../middleware/checkFields.js'

const router = express.Router()

// /api/perfume
router
  .route('/')
  .get(protect, client, perfume.getPerfumes)
  .post(protect, client, perfumeAddField, perfume.addPerfume)
router
  .route('/:id')
  .get(protect, client, perfume.getPerfume)
  .put(protect, client, perfumeAddField, perfume.editPerfume)
  .delete(protect, client, perfume.deletePerfume)

export default router
