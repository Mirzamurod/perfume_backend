import express from 'express'
import { admin, client, protect } from '../middleware/authMiddleware.js'
import user from './../controllers/userController.js'
import { userAddField, userLoginField, userUpdateField } from '../middleware/checkFields.js'

const router = express.Router()

// /api
router
  .route('/users')
  .get(protect, admin, user.getUsers)
  .post(userAddField, user.register)
  .put(protect, userUpdateField, user.update)
  .delete(protect, user.delete)
router.get('/users/profile', protect, user.getUser)
router.post('/users/login', userLoginField, user.login)
router
  .route('/client')
  .get(protect, admin, user.getClientsByAdmin)
  .post(protect, admin, userAddField, user.addClientByAdmin)
router
  .route('/client/:id')
  .get(protect, admin, user.getClientByAdmin)
  .patch(protect, admin, user.editClientByAdmin)
  .delete(protect, admin, user.deleteClientByAdmin)
router
  .route('/supplier')
  .get(protect, client, user.getSuppliersByClient)
  .post(protect, client, userAddField, user.addSupplierByClient)
router
  .route('/supplier/:id')
  .get(protect, client, user.getSupplierByClient)
  .patch(protect, client, user.editSupplierByClient)
  .delete(protect, client, user.deleteSupplierByClient)

export default router
