import expressAsyncHandler from 'express-async-handler'
import Product from '../models/productModel.js'
import { validationResult } from 'express-validator'
import slugify from 'slugify'

const slug = name => slugify(name, { lower: true, strict: true })

const product = {
  /**
   * @desc    Get Product
   * @route   GET /api/product
   * @access  Private
   */
  getProducts: expressAsyncHandler(async (req, res) => {
    const { limit = 20, page = 0, sortName, sortValue, search, searchName } = req.query

    if (+limit && +page) {
      const products = await Product.find({
        userId: req.user.id,
        ...(searchName
          ? { [searchName]: { $regex: search ?? '', $options: 'i' } }
          : { name: { $regex: search ?? '', $options: 'i' } }),
      })
        .sort(sortValue ? { [sortName]: sortValue } : sortName)
        .limit(+limit)
        .skip(+limit * (+page - 1))

      const pageLists = Math.ceil((await Product.find({ userId: req.user.id })).length / limit)

      res
        .status(200)
        .json({ data: products, pageLists: pageLists || 1, page, count: products.length })
    } else {
      const products = await Product.find({
        userId: req.user.id,
        ...(searchName
          ? { [searchName]: { $regex: search ?? '', $options: 'i' } }
          : { name: { $regex: search ?? '', $options: 'i' } }),
      }).sort(sortValue ? { [sortName]: sortValue } : sortName)
      res.status(200).json({ data: products })
    }
  }),

  /**
   * @desc    Get Product
   * @route   GET /api/product/:id
   * @access  Private
   */
  getProduct: expressAsyncHandler(async (req, res) => {
    await Product.findById(req.params.id)
      .then(response => {
        if (response) res.status(200).json({ data: response })
        else res.status(400).json({ message: 'product_not_found', success: false })
      })
      .catch(error => res.status(400).json({ success: false, message: error.message }))
  }),

  /**
   * @desc    Add Product
   * @route   POST /api/product
   * @access  Private
   */
  addProduct: expressAsyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ messages: errors.array(), success: false })
    }

    const { name } = req.body

    await Product.findOne({ name, userId: req.user.id })
      .then(async response => {
        if (response)
          res
            .status(400)
            .json({ success: false, messages: [{ msg: 'product_already_exists', path: 'name' }] })
        else {
          await Product.create({ ...req.body, userId: req.user.id, slug: slug(req.body.name) })
            .then(response => {
              if (response) res.status(201).json({ message: 'product_added', success: true })
            })
            .catch(error => res.status(400).json({ message: error.message, success: false }))
        }
      })
      .catch(error => res.status(400).json({ message: error.message, success: false }))
  }),

  /**
   * @desc    Edit Product
   * @route   PUT /api/product/:id
   * @access  Private
   */
  editProduct: expressAsyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ messages: errors.array(), success: false })
    }

    await Product.findById(req.params.id)
      .then(async response => {
        if (!response) res.status(400).json({ success: false, message: 'product_not_found' })
        else {
          await Product.findByIdAndUpdate(
            req.params.id,
            { ...req.body, slug: slug(req.body.name) },
            { new: true }
          )
            .then(() => res.status(200).json({ success: true, message: 'product_updated' }))
            .catch(error => res.status(400).json({ success: false, message: error.message }))
        }
      })
      .catch(error => res.status(400).json({ message: error.message, success: false }))
  }),

  /**
   * @desc    Delete Product
   * @route   DELETE /api/product/:id
   * @access  Private
   */
  deleteProduct: expressAsyncHandler(async (req, res) => {
    await Product.findByIdAndDelete(req.params.id)
      .then(response => {
        if (response) res.status(200).json({ success: true, message: 'product_deleted' })
        else res.status(400).json({ success: false, message: 'product_not_found' })
      })
      .catch(error => res.status(400).json({ success: false, message: error.message }))
  }),
}

export default product
