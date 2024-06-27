import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import expressAsyncHandler from 'express-async-handler'
import User from './../models/userModel.js'
import { validationResult } from 'express-validator'

const salt = await bcryptjs.genSalt(10)

const user = {
  /**
   * @desc    Get users
   * @route   GET /api/users
   * @access  Private
   */
  getUsers: expressAsyncHandler(async (req, res) => {
    const { limit, page, sortName, sortValue } = req.query
    if (+limit && +page) {
      const users = await User.find({}, { password: 0 })
        .sort(sortValue ? { [sortName]: sortValue } : sortName)
        .limit(+limit)
        .skip(+limit * (+page - 1))

      const pageLists = Math.ceil((await User.find({}, { password: 0 })).length / limit)

      res.status(200).json({ data: users, pageLists, page })
    } else {
      const users = await User.find({}, { password: 0 }).sort(
        sortValue ? { [sortName]: sortValue } : sortName
      )
      res.status(200).json({ data: users })
    }
  }),

  /**
   * @desc    Get user profile
   * @route   GET /api/users/profile
   * @access  Private
   */
  getUser: expressAsyncHandler(async (req, res) => {
    if (!req.user) res.status(400).json({ success: false, message: 'User not found !!!' })
    else res.status(200).json({ data: req.user })
  }),

  /**
   * @desc    Register new User
   * @route   POST /api/users
   * @access  Public
   */
  register: expressAsyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ messages: errors.array(), success: false })
    }

    const { phone, password } = req.body

    const userExists = await User.findOne({ phone })

    if (userExists)
      res
        .status(400)
        .json({ success: false, messages: [{ msg: 'User already exists', path: 'phone' }] })
    else {
      const hashedPassword = await bcryptjs.hash(password, salt)
      const user = await User.create({ phone, password: hashedPassword, role: 'client' })

      if (user) res.status(201).json({ message: 'User added', success: true })
      else res.status(400).json({ success: false, message: 'Invalid user data' })
    }
  }),

  /**
   * @desc    Login User
   * @route   POST /api/users/login
   * @access  Public
   */
  login: expressAsyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ messages: errors.array(), success: false })
    }

    const { phone, password } = req.body

    const user = await User.findOne({ phone })
    if (user) {
      if (await bcryptjs.compare(password, user.password))
        res.status(200).json({ data: { token: generateToken(user._id) }, success: true })
      else res.status(400).json({ success: false, message: 'Phone or password wrong' })
    } else
      res.status(400).json({ success: false, messages: [{ msg: 'User not found', path: 'phone' }] })
  }),

  /**
   * @desc    Edit User
   * @route   PUT /api/users/update
   * @access  Private
   */
  update: expressAsyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ messages: errors.array(), success: false })
    }

    const user = await User.findById(req.user.id)
    const { currentPassword } = req.body

    // Check User
    if (!user) {
      res.status(401)
      throw new Error('User not found!!!')
    } else {
      // Check Current Password
      if (currentPassword) {
        bcryptjs
          .compare(currentPassword, user.password)
          .then(async checkPassword => {
            if (checkPassword) {
              const hashedPassword = await bcryptjs.hash(req.body.newPassword.toString(), salt)
              await User.findByIdAndUpdate(
                req.user.id,
                { ...req.body, password: hashedPassword },
                { new: true }
              )
              res.status(200).json({ success: true, message: 'User Updated' })
            } else
              res.status(400).json({
                success: false,
                messages: [{ msg: 'Current password is wrong', path: 'currentPassword' }],
              })
          })
          .catch(err => res.status(400).json({ success: false, message: err.message }))
      } else {
        await User.findByIdAndUpdate(req.user.id, req.body)
        res.status(200).json({ success: true, message: 'User Updated' })
      }
    }
  }),

  /**
   * @desc    Delete User
   * @route   DELETE /api/users/delete
   * @access  Private
   */
  delete: expressAsyncHandler(async (req, res) => {
    if (req.user) {
      await User.findByIdAndDelete(req.user.id)
      res.status(200).json({ success: true, message: 'success' })
    } else res.status(400).json({ success: false, message: 'User not found' })
  }),

  /**
   * @desc    Add Client by Admin
   * @route   POST /api/users/client
   * @access  Private
   */
  addClientByAdmin: expressAsyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ messages: errors.array(), success: false })
    }

    const { phone, password } = req.body

    await User.findOne({ phone })
      .then(async response => {
        if (response)
          res
            .status(400)
            .json({ success: false, messages: [{ msg: 'User already exists', path: 'phone' }] })
        else {
          const hashedPassword = await bcryptjs.hash(password, salt)
          const user = await User.create({
            phone,
            password: hashedPassword,
            userId: req.user.id,
            role: 'client',
          })

          if (user) res.status(201).json({ message: 'Client added', success: true })
          else res.status(400).json({ success: false, message: 'Invalid client data' })
        }
      })
      .catch(error => res.status(400).json({ message: error.message, success: false }))
  }),

  /**
   * @desc    Get Client by Admin
   * @route   GET /api/users/client/:id
   * @access  Private
   */
  getClientByAdmin: expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id, { password: 0 })
    if (user && user.role === 'client') res.status(200).json({ data: user })
    else res.status(400).json({ message: 'Client not found', success: false })
  }),

  /**
   * @desc    Edit Client by Admin
   * @route   PUT /api/users/client/:id
   * @access  Private
   */
  editClientByAdmin: expressAsyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ messages: errors.array(), success: false })
    }

    await User.findOne({ _id: req.params.id, role: 'client' })
      .then(async response => {
        if (req.body.currentPassword) {
          bcryptjs
            .compare(req.body.currentPassword, response.password)
            .then(async checkPassword => {
              if (checkPassword) {
                const hashedPassword = await bcryptjs.hash(req.body.newPassword.toString(), salt)
                await User.findByIdAndUpdate(
                  response.id,
                  { ...req.body, password: hashedPassword },
                  { new: true }
                )
                  .then(() => res.status(200).json({ success: true, message: 'Client Updated' }))
                  .catch(errorUpdated =>
                    res.status(400).json({ message: errorUpdated.message, success: false })
                  )
              } else
                res.status(400).json({
                  success: false,
                  messages: [{ msg: 'Current password is wrong', path: 'currentPassword' }],
                })
            })
            .catch(err => res.status(400).json({ success: false, message: err.message }))
        } else {
          await User.findByIdAndUpdate(response.id, req.body, { new: true })
          res.status(200).json({ success: true, message: 'Client Updated' })
        }
      })
      .catch(error => res.status(400).json({ success: false, message: error.message }))
  }),

  /**
   * @desc    Delete Client by Admin
   * @route   DELETE /api/users/client/:id
   * @access  Private
   */
  deleteClientByAdmin: expressAsyncHandler(async (req, res) => {
    await User.findByIdAndDelete(req.params.id)
      .then(response => {
        if (response)
          res.status(200).json({ message: 'Client successfully deleted', success: true })
        else res.status(400).json({ success: false, message: 'Client not found' })
      })
      .catch(error => res.status(400).json({ message: error.message, success: false }))
  }),

  /**
   * @desc    Add Supplier by Client
   * @route   POST /api/users/supplier
   * @access  Private
   */
  addSupplierByClient: expressAsyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ messages: errors.array(), success: false })
    }

    const { phone, password } = req.body

    await User.findOne({ phone })
      .then(async response => {
        if (response)
          res
            .status(400)
            .json({ success: false, messages: [{ msg: 'User already exists', path: 'phone' }] })
        else {
          const hashedPassword = await bcryptjs.hash(password, salt)
          const user = await User.create({
            phone,
            password: hashedPassword,
            // userId: req.user.id,
            role: 'supplier',
          })

          if (user) res.status(201).json({ message: 'Client added', success: true })
          else res.status(400).json({ success: false, message: 'Invalid client data' })
        }
      })
      .catch(error => res.status(400).json({ message: error.message, success: false }))
  }),

  /**
   * @desc    Get Supplier by Client
   * @route   GET /api/users/supplier/:id
   * @access  Private
   */
  getSupplierByClient: expressAsyncHandler(async (req, res) => {
    await User.findById(req.params.id, { password: 0 })
      .then(response => {
        if (response) res.status(200).json({ data: response })
        else res.status(400).json({ success: false, message: 'Supplier not found' })
      })
      .catch(error => res.status(400).json({ message: error.message, success: false }))
  }),

  /**
   * @desc    Edit Supplier by Client
   * @route   PUT /api/users/supplier/:id
   * @access  Private
   */
  editSupplierByClient: expressAsyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ messages: errors.array(), success: false })
    }

    await User.findOne({ _id: req.params.id, role: 'supplier' })
      .then(async response => {
        if (req.body.currentPassword) {
          bcryptjs
            .compare(req.body.currentPassword, response.password)
            .then(async checkPassword => {
              if (checkPassword) {
                const hashedPassword = await bcryptjs.hash(req.body.newPassword.toString(), salt)
                await User.findByIdAndUpdate(
                  response.id,
                  { ...req.body, password: hashedPassword },
                  { new: true }
                )
                  .then(() => res.status(200).json({ success: true, message: 'Supplier Updated' }))
                  .catch(errorUpdated =>
                    res.status(400).json({ message: errorUpdated.message, success: false })
                  )
              } else
                res.status(400).json({
                  success: false,
                  messages: [{ msg: 'Current password is wrong', path: 'currentPassword' }],
                })
            })
            .catch(err => res.status(400).json({ success: false, message: err.message }))

          // } else
        } else {
          await User.findByIdAndUpdate(response.id, req.body, { new: true })
          res.status(200).json({ success: true, message: 'Supplier Updated' })
        }
      })
      .catch(error => res.status(400).json({ success: false, message: error.message }))
  }),

  /**
   * @desc    Delete Supplier by Client
   * @route   DELETE /api/users/supplier/:id
   * @access  Private
   */
  deleteSupplierByClient: expressAsyncHandler(async (req, res) => {
    await User.findByIdAndDelete(req.params.id)
      .then(response => {
        if (response)
          res.status(200).json({ success: true, message: 'Supplier successfully deleted' })
        else res.status(400).json({ success: false, message: 'Supplier not found' })
      })
      .catch(error => res.status(400).json({ success: false, message: error.message }))
  }),
}

const generateToken = id => jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '14d' })

export default user
