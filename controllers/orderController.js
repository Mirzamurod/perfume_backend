import expressAsyncHandler from 'express-async-handler'
import Order from './../models/orderModel.js'
import { validationResult } from 'express-validator'
import { Types } from 'mongoose'

const order = {
  /**
   * @desc    Get Orders
   * @route   GET /api/order
   * @access  Private
   */
  getOrders: expressAsyncHandler(async (req, res) => {
    const { limit, page, sortName, sortValue, search, searchName } = req.query

    const pageLists = Math.ceil((await Order.find({ userId: req.user.id })).length / (limit ?? 20))

    await Order.aggregate([
      {
        $match: {
          userId: req.user._id,
          ...(searchName
            ? { [searchName]: { $regex: search ?? '', $options: 'i' } }
            : { name: { $regex: search ?? '', $options: 'i' } }),
        },
      },
      {
        $lookup: { from: 'users', localField: 'supplierId', foreignField: '_id', as: 'supplier' },
      },
      { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$perfumes', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'perfumes',
          localField: 'perfumes.id',
          foreignField: '_id',
          as: 'perfumes.perfume',
        },
      },
      { $unwind: { path: '$perfumes.perfume', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$_id',
          phone: { $first: '$phone' },
          name: { $first: '$name' },
          location: { $first: '$location' },
          supplier: { $first: '$supplier' },
          perfumes: { $push: { perfume: '$perfumes.perfume', qty: '$perfumes.qty' } },
        },
      },
      { $limit: limit ?? 20 },
      { $skip: (limit ?? 20) * (page ?? 0) },
      { $sort: { [sortName]: sortValue ?? 1 } },
    ])
      .then(response =>
        res.status(200).json({ data: response, pageLists, page: page ?? 0, count: response.length })
      )
      .catch(error => res.status(400).json({ success: false, message: error.message }))
  }),

  /**
   * @desc    Get Order
   * @route   GET /api/order/:id
   * @access  Private
   */
  getOrder: expressAsyncHandler(async (req, res) => {
    await Order.aggregate([
      { $match: { _id: new Types.ObjectId(req.params.id) } },
      {
        $lookup: {
          from: 'suppliers',
          localField: 'supplierId',
          foreignField: '_id',
          as: 'supplier',
        },
      },
      { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$perfumes', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'perfumes',
          localField: 'perfumes.id',
          foreignField: '_id',
          as: 'perfumes.perfume',
        },
      },
      { $unwind: { path: '$perfumes.perfume', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$_id',
          phone: { $first: '$phone' },
          name: { $first: '$name' },
          location: { $first: '$location' },
          supplier: { $first: '$supplier' },
          perfumes: { $push: { perfume: '$perfumes.perfume', qty: '$perfumes.qty' } },
        },
      },
    ])
      .then(response => {
        if (response[0]) res.status(200).json({ data: response[0] })
        else res.status(400).json({ message: 'Order not found', success: false })
      })
      .catch(error => res.status(400).json({ success: false, message: error.message }))
  }),

  /**
   * @desc    Add Order
   * @route   POST /api/order
   * @access  Private
   */
  addOrder: expressAsyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ messages: errors.array(), success: false })
    }

    if (!req.body.perfume.length)
      res.status(400).json({ success: false, message: 'Must have at least 1 perfume' })
    else {
      await Order.create({ ...req.body, userId: req.user.id })
        .then(response => {
          if (response) res.status(201).json({ success: true, message: 'Order successfully added' })
          else res.status(400).json({ success: false, message: 'Order data is invalid' })
        })
        .catch(error => res.status(400).json({ success: false, message: error.message }))
    }
  }),

  /**
   * @desc    Edit Order
   * @route   PUT /api/order/:id
   * @access  Private
   */
  editOrder: expressAsyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ messages: errors.array(), success: false })
    }

    await Order.findById(req.params.id)
      .then(async response => {
        if (!response) res.status(400).json({ success: false, message: 'Order not found' })
        else {
          if (!req.body.perfume.length)
            res.status(400).json({ success: false, message: 'Must have at least 1 perfume' })
          else
            await Order.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true })
              .then(() =>
                res.status(200).json({ success: true, message: 'Order successfully updated' })
              )
              .catch(error => res.status(400).json({ success: false, message: error.message }))
        }
      })
      .catch(error => res.status(400).json({ message: error.message, success: false }))
  }),

  /**
   * @desc    Delete Order
   * @route   DELETE /api/order/:id
   * @access  Private
   */
  deleteOrder: expressAsyncHandler(async (req, res) => {
    await Order.findByIdAndDelete(req.params.id)
      .then(response => {
        if (response) res.status(200).json({ success: true, message: 'Order successfully deleted' })
        else res.status(400).json({ success: false, message: 'Order not found' })
      })
      .catch(error => res.status(400).json({ success: false, message: error.message }))
  }),
}

export default order
