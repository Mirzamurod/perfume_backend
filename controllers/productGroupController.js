import expressAsyncHandler from 'express-async-handler'
import PurchasedProduct from '../models/purchasedProductModel.js'
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

    await ProductGroup.aggregate([
      { $match: { userId: req.user._id } },
      {
        $lookup: { from: 'products', localField: 'product_id', foreignField: '_id', as: 'product' },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$product_id',
          count: { $sum: '$count' },
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
      .then(response => res.status(200).json({ data: response }))
      .catch(error => res.status(400).json({ success: false, message: error.message }))
  }),

  /**
   * @desc    Get Product Group
   * @route   GET /api/product-group/:id
   * @access  Private
   */
  getProductGroup: expressAsyncHandler(async (req, res) => {
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
}

export default productGroup
