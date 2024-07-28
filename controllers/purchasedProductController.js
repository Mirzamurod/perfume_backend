import expressAsyncHandler from 'express-async-handler'
import PurchasedProduct from '../models/purchasedProductModel.js'
import ProductGroup from '../models/productGroupModel.js'
import { validationResult } from 'express-validator'
import { Types } from 'mongoose'

const purchasedProduct = {
  /**
   * @desc    Get Purchased Product
   * @route   GET /api/purchased-product
   * @access  Private
   */
  getPurchasedProducts: expressAsyncHandler(async (req, res) => {
    const { limit = 20, page = 1, sortName, sortValue, search, searchName } = req.query

    let pageLists = 1

    await PurchasedProduct.aggregate([
      { $match: { userId: req.user._id } },
      {
        $lookup: { from: 'products', localField: 'product_id', foreignField: '_id', as: 'product' },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$_id',
          count: { $first: '$count' },
          purchased_price: { $first: '$purchased_price' },
          sale_price: { $first: '$sale_price' },
          product: { $first: '$product' },
        },
      },
      {
        $match: {
          ...(searchName
            ? { [`product.${searchName}`]: { $regex: search ?? '', $options: 'i' } }
            : { 'product.name': { $regex: search ?? '', $options: 'i' } }),
        },
      },
      { $count: 'total' },
    ]).then(response => {
      if (response.length) pageLists = response[0].total
      else pageLists = 1
    })

    await PurchasedProduct.aggregate([
      { $match: { userId: req.user._id } },
      {
        $lookup: { from: 'products', localField: 'product_id', foreignField: '_id', as: 'product' },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$_id',
          count: { $first: '$count' },
          purchased_price: { $first: '$purchased_price' },
          sale_price: { $first: '$sale_price' },
          product: { $first: '$product' },
        },
      },
      {
        $match: {
          ...(searchName
            ? { [`product.${searchName}`]: { $regex: search ?? '', $options: 'i' } }
            : { 'product.name': { $regex: search ?? '', $options: 'i' } }),
        },
      },
      { $sort: { [sortName]: sortValue ?? 1 } },
      limit ? { $limit: +limit } : {},
      page ? { $skip: +limit * (+page - 1) } : {},
    ])
      .then(response =>
        res.status(200).json({
          page,
          data: response,
          count: response.length,
          pageLists: Math.ceil(pageLists / limit),
        })
      )
      .catch(error => res.status(400).json({ success: false, message: error.message }))
  }),

  /**
   * @desc    Get Purchased Product Group
   * @route   GET /api/purchased-product/group
   * @access  Private
   */
  getPurchasedProductsGroup: expressAsyncHandler(async (req, res) => {
    const { limit = 20, page = 1, sortName, sortValue, search, searchName } = req.query

    let pageLists = 1

    await PurchasedProduct.aggregate([
      { $match: { userId: req.user._id } },
      {
        $lookup: { from: 'products', localField: 'product_id', foreignField: '_id', as: 'product' },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$_id',
          count: { $first: '$count' },
          purchased_price: { $first: '$purchased_price' },
          sale_price: { $first: '$sale_price' },
          product: { $first: '$product' },
        },
      },
      {
        $match: {
          ...(searchName
            ? { [`product.${searchName}`]: { $regex: search ?? '', $options: 'i' } }
            : { 'product.name': { $regex: search ?? '', $options: 'i' } }),
        },
      },
      { $count: 'total' },
    ]).then(response => {
      if (response.length) pageLists = response[0].total
      else pageLists = 1
    })

    await PurchasedProduct.aggregate([
      { $match: { userId: req.user._id } },
      {
        $lookup: { from: 'products', localField: 'product_id', foreignField: '_id', as: 'product' },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$product_id',
          count: { $sum: '$count' },
          purchased_price: { $last: '$purchased_price' },
          sale_price: { $last: '$sale_price' },
          product: { $first: '$product' },
        },
      },
      {
        $match: {
          ...(searchName
            ? { [`product.${searchName}`]: { $regex: search ?? '', $options: 'i' } }
            : { 'product.name': { $regex: search ?? '', $options: 'i' } }),
        },
      },
      { $sort: { [sortName]: sortValue ?? 1, count: 1 } },
      { $limit: +limit },
      { $skip: +limit * (+page - 1) },
    ])
      .then(response =>
        res.status(200).json({
          page,
          data: response,
          count: response.length,
          pageLists: Math.ceil(pageLists / limit),
        })
      )
      .catch(error => res.status(400).json({ success: false, message: error.message }))
  }),

  /**
   * @desc    Get Purchased Product
   * @route   GET /api/purchased-product/:id
   * @access  Private
   */
  getPurchasedProduct: expressAsyncHandler(async (req, res) => {
    await PurchasedProduct.aggregate([
      { $match: { userId: req.user._id, _id: new Types.ObjectId(req.params.id) } },
      {
        $lookup: { from: 'products', localField: 'product_id', foreignField: '_id', as: 'product' },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$_id',
          count: { $first: '$count' },
          purchased_price: { $first: '$purchased_price' },
          sale_price: { $first: '$sale_price' },
          product: { $first: '$product' },
        },
      },
    ])
      .then(response => {
        if (response[0]) res.status(200).json({ data: response[0] })
        else res.status(400).json({ message: 'purchased_product_not_found', success: false })
      })
      .catch(error => res.status(400).json({ success: false, message: error.message }))
  }),

  /**
   * @desc    Add Purchased Product
   * @route   POST /api/purchased-product
   * @access  Private
   */
  addPurchasedProduct: expressAsyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ messages: errors.array(), success: false })
    }

    await ProductGroup.findOne({ product_id: req.body.product_id })
      .then(async response => {
        if (response)
          await ProductGroup.findByIdAndUpdate(response._id, {
            count: +response.count + +req.body.count,
            sale_price: req.body.sale_price,
          })
        else ProductGroup.create({ ...req.body, userId: req.user.id })
      })
      .catch(error => res.status(400).json({ message: error.message, success: false }))

    await PurchasedProduct.create({ ...req.body, userId: req.user.id })
      .then(response => {
        if (response) res.status(201).json({ message: 'purchased_product_added', success: true })
      })
      .catch(error => res.status(400).json({ message: error.message, success: false }))
  }),

  /**
   * @desc    Edit Purchased Product
   * @route   PUT /api/purchased-product/:id
   * @access  Private
   */
  editPurchasedProduct: expressAsyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ messages: errors.array(), success: false })
    }

    await PurchasedProduct.findById(req.params.id)
      .then(async response => {
        if (!response)
          res.status(400).json({ success: false, message: 'purchased_product_not_found' })
        else {
          await PurchasedProduct.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true })
            .then(() =>
              res.status(200).json({ success: true, message: 'purchased_product_updated' })
            )
            .catch(error => res.status(400).json({ success: false, message: error.message }))
        }
      })
      .catch(error => res.status(400).json({ message: error.message, success: false }))
  }),

  /**
   * @desc    Delete Purchased Product
   * @route   DELETE /api/purchased-product/:id
   * @access  Private
   */
  deletePurchasedProduct: expressAsyncHandler(async (req, res) => {
    await PurchasedProduct.findByIdAndDelete(req.params.id)
      .then(response => {
        if (response) res.status(200).json({ success: true, message: 'purchased_product_deleted' })
        else res.status(400).json({ success: false, message: 'purchased_product_not_found' })
      })
      .catch(error => res.status(400).json({ success: false, message: error.message }))
  }),
}

export default purchasedProduct
