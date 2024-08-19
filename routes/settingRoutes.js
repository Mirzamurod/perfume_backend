import express from 'express'
import { client, protect } from '../middleware/authMiddleware.js'
import { settingAddField } from '../middleware/checkFields.js'
import setting from '../controllers/settingController.js'

const router = express.Router()

// /api/setting
router
  .route('/')
  .get(protect, client, setting.getSetting)
  .post(protect, client, settingAddField, setting.addSetting)
  .patch(protect, client, setting.editSetting)

export default router
