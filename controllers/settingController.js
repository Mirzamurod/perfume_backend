import expressAsyncHandler from 'express-async-handler'
import Setting from './../models/settingModel.js'
import { validationResult } from 'express-validator'

const setting = {
  /**
   * @desc    Get Setting
   * @route   GET /api/setting
   * @access  Private
   */
  getSetting: expressAsyncHandler(async (req, res) => {
    await Setting.findOne({ userId: req.user.id })
      .then(response => res.status(200).json({ data: response }))
      .catch(error => res.status(400).json({ success: false, message: error.message }))
  }),

  /**
   * @desc    Add Setting
   * @route   POST /api/setting
   * @access  Private
   */
  addSetting: expressAsyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ messages: errors.array(), success: false })
    }

    await Setting.create({ ...req.body, userId: req.user.id })
      .then(() => res.status(201).json({ success: true, message: 'added_settings' }))
      .catch(error => res.status(400).json({ success: false, message: error.message }))
  }),

  /**
   * @desc    Edit Setting
   * @route   PATCH /api/setting
   * @access  Private
   */
  editSetting: expressAsyncHandler(async (req, res) => {
    await Setting.updateOne({ userId: req.user.id }, req.body, { new: true })
      .then(() => res.status(200).json({ success: true, message: 'edited_settings' }))
      .catch(error => res.status(400).json({ success: false, message: error.message }))
  }),
}

export default setting
