import expressAsyncHandler from 'express-async-handler'
import ProductGroup from '../models/productGroupModel.js'
import { Types } from 'mongoose'

const productGroup = {
  /**
   * @desc    Get Product Group
   * @route   GET /api/product-group
   * @access  Private
   */
  getProductsGroup: expressAsyncHandler(async (req, res) => {
    const { limit = 20, page = 1, sortName, sortValue, search, searchName } = req.query

    let pageLists = 1

    await ProductGroup.aggregate([
      { $match: { userId: req.user._id } },
      // {
      //   $lookup: { from: 'products', localField: 'product_id', foreignField: '_id', as: 'product' },
      // },
      // { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      // {
      //   $group: {
      //     _id: '$_id',
      //     originalData: { $first: '$$ROOT' },
      //     // count: { $first: '$count' },
      //     // purchased_price: { $first: '$purchased_price' },
      //     // sale_price: { $first: '$sale_price' },
      //     product: { $first: '$product' },
      //   },
      // },
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

    await ProductGroup.aggregate([
      { $match: { userId: req.user._id } },
      {
        $lookup: { from: 'products', localField: 'product_id', foreignField: '_id', as: 'product' },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$_id',
          originalData: { $first: '$$ROOT' },
          product: { $first: '$product' },
        },
      },
      {
        $replaceRoot: { newRoot: '$originalData' },
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
      .then(response => res.status(200).json({ data: response }))
      .catch(error => res.status(400).json({ success: false, message: error.message }))
  }),

  /**
   * @desc    Get Product Group
   * @route   GET /api/product-group/:id
   * @access  Private
   */
  getProductGroup: expressAsyncHandler(async (req, res) => {
    await ProductGroup.aggregate([
      { $match: { userId: req.user._id, _id: new Types.ObjectId(req.params.id) } },
      {
        $lookup: { from: 'products', localField: 'product_id', foreignField: '_id', as: 'product' },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$_id',
          originalData: { $first: '$$ROOT' },
          product: { $first: '$product' },
        },
      },
      {
        $replaceRoot: { newRoot: '$originalData' },
      },
    ])
      .then(response => {
        if (response[0]) res.status(200).json({ data: response[0] })
        else res.status(400).json({ message: 'purchased_product_not_found', success: false })
      })
      .catch(error => res.status(400).json({ success: false, message: error.message }))
  }),

  /**
   * @desc    Get Product Group for order
   * @route   GET /api/product-group/order/:user
   * @access  Public
   */
  getProductGroupOrder: expressAsyncHandler(async (req, res) => {
    const { product } = req.query
    const { user } = req.params

    await ProductGroup.aggregate([
      { $match: { userId: new Types.ObjectId(user), _id: new Types.ObjectId(product) } },
      {
        $lookup: { from: 'products', localField: 'product_id', foreignField: '_id', as: 'product' },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$_id',
          originalData: { $first: '$$ROOT' },
          product: { $first: '$product' },
        },
      },
      {
        $replaceRoot: { newRoot: '$originalData' },
      },
    ])
      .then(response => {
        if (response[0]) res.status(200).json({ data: response[0] })
        else res.status(400).json({ message: 'purchased_product_not_found', success: false })
      })
      .catch(error => res.status(400).json({ success: false, message: error.message }))
  }),
}

export default productGroup
