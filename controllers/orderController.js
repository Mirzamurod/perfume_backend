import expressAsyncHandler from 'express-async-handler'
import Order from './../models/orderModel.js'
import ProductGroup from '../models/productGroupModel.js'
import { validationResult } from 'express-validator'
import { Types } from 'mongoose'

const order = {
  /**
   * @desc    Get Orders
   * @route   GET /api/order
   * @access  Private
   */
  getOrders: expressAsyncHandler(async (req, res) => {
    const { limit = 20, page = 1, sortName, sortValue, search, searchName, status } = req.query

    let pageLists = 1

    await Order.aggregate([
      {
        $match: {
          userId: req.user._id,
          status,
          ...(searchName
            ? { [searchName]: { $regex: search ?? '', $options: 'i' } }
            : { name: { $regex: search ?? '', $options: 'i' } }),
        },
      },
      // {
      //   $lookup: { from: 'users', localField: 'supplierId', foreignField: '_id', as: 'supplier' },
      // },
      // { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: true } },
      // { $unwind: { path: '$perfumes', preserveNullAndEmptyArrays: true } },
      // {
      //   $lookup: {
      //     from: 'perfumes',
      //     localField: 'perfumes.id',
      //     foreignField: '_id',
      //     as: 'perfumes.perfume',
      //   },
      // },
      // { $unwind: { path: '$perfumes.perfume', preserveNullAndEmptyArrays: true } },
      // {
      //   $group: {
      //     _id: '$_id',
      //     phone: { $first: '$phone' },
      //     name: { $first: '$name' },
      //     location: { $first: '$location' },
      //     supplier: { $first: '$supplier' },
      //     perfumes: { $push: { perfume: '$perfumes.perfume', qty: '$perfumes.qty' } },
      //   },
      // },
      { $count: 'total' },
    ]).then(response => {
      if (response.length) pageLists = response[0].total
      else pageLists = 1
    })

    await Order.aggregate([
      {
        $match: {
          [req.user.role === 'client' ? 'userId' : 'supplierId']: req.user._id,
          status,
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
          from: 'products',
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
          payment_method: { $first: '$payment_method' },
          delivery_date: { $first: '$delivery_date' },
          status: { $first: '$status' },
          perfumes: { $push: { perfume: '$perfumes.perfume', qty: '$perfumes.qty' } },
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
   * @desc    Get Order
   * @route   GET /api/order/:id
   * @access  Private
   */
  getOrder: expressAsyncHandler(async (req, res) => {
    await Order.aggregate([
      { $match: { _id: new Types.ObjectId(req.params.id) } },
      {
        $lookup: { from: 'users', localField: 'supplierId', foreignField: '_id', as: 'supplier' },
      },
      { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$perfumes', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'products',
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
          delivery_date: { $first: '$delivery_date' },
          perfumes: { $push: { perfume: '$perfumes.perfume', qty: '$perfumes.qty' } },
        },
      },
    ])
      .then(response => {
        if (response[0]) res.status(200).json({ data: response[0] })
        else res.status(400).json({ message: 'order_not_found', success: false })
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

    if (!req.body?.perfumes?.length)
      res.status(400).json({ success: false, message: 'must_have_perfume' })
    else {
      const bulkOperations = req.body?.perfumes?.map(product => {
        return {
          updateOne: {
            filter: { product_id: product.id },
            update: { $inc: { count: -product.qty } },
          },
        }
      })

      await Order.create({
        ...req.body,
        userId: req.user.id,
        ...(req.body.supplierId ? { supplierId: req.body.supplierId } : { supplierId: null }),
      })
        .then(async response => {
          if (response) {
            await ProductGroup.bulkWrite(bulkOperations).catch(error =>
              res.status(400).json({ success: false, message: error.message })
            )

            res.status(201).json({ success: true, message: 'order_added' })
          } else res.status(400).json({ success: false, message: 'order_data_invalid' })
        })
        .catch(error => res.status(400).json({ success: false, message: error.message }))
    }
  }),

  /**
   * @desc    Edit Order
   * @route   PATCH /api/order/:id
   * @access  Private
   */
  editOrder: expressAsyncHandler(async (req, res) => {
    const changeOrder = async bulkWrite =>
      await Order.findByIdAndUpdate(
        req.params.id,
        {
          ...req.body,
          ...(req.body.supplierId ? { supplierId: req.body.supplierId } : { supplierId: null }),
        },
        { new: true }
      )
        .then(async () => {
          if (bulkWrite)
            await ProductGroup.bulkWrite(bulkWrite)
              .then(async () => changeOrder())
              .catch(error => res.status(400).json({ success: false, message: error.message }))

          res.status(200).json({ success: true, message: 'order_updated' })
        })
        .catch(error => res.status(400).json({ success: false, message: error.message }))

    await Order.findById(req.params.id)
      .then(async response => {
        if (!response) res.status(400).json({ success: false, message: 'order_not_found' })
        else {
          if (req.body?.perfumes?.length) {
            const mergedItems1 = Object.values(
              response.perfumes.reduce((acc, { qty, id }) => {
                acc[id] = acc[id] || { qty: 0, id }
                acc[id].qty += qty
                return acc
              }, {})
            )

            const mergedItems2 = Object.values(
              req.body.perfumes.reduce((acc, { qty, id }) => {
                acc[id] = acc[id] || { qty: 0, id }
                acc[id].qty += qty
                return acc
              }, {})
            )

            let deletedItems = mergedItems1
              .filter(
                item1 => !mergedItems2.some(item2 => item2.id.toString() === item1.id.toString())
              )
              .map(product => {
                return {
                  updateOne: {
                    filter: { product_id: product.id },
                    update: { $inc: { count: product.qty } },
                  },
                }
              })

            const bulkOperations = mergedItems2?.map(item2 => {
              const item1 = mergedItems1.find(item1 => item1.id.toString() === item2.id.toString())
              const count = +item2.qty - (+item1?.qty || 0)
              return {
                updateOne: {
                  filter: { product_id: item2.id },
                  update: { $inc: { count: -count } },
                },
              }
            })

            changeOrder([...bulkOperations, ...deletedItems])
            // await ProductGroup.bulkWrite([...bulkOperations, ...deletedItems])
            //   .then(async () => )
            //   .catch(error => res.status(400).json({ success: false, message: error.message }))
          } else {
            if (response.status === 'cancelled') {
              const bulkOperations = response.perfumes.map(item => {
                return {
                  updateOne: {
                    filter: { product_id: item.id },
                    update: { $inc: { count: -item.qty } },
                  },
                }
              })

              changeOrder(bulkOperations)

              // await ProductGroup.bulkWrite(bulkOperations)
              //   .then(async () => )
              //   .catch(error => res.status(400).json({ success: false, message: error.message }))
            } else if (req.body.status === 'cancelled') {
              const bulkOperations = response.perfumes.map(item => {
                return {
                  updateOne: {
                    filter: { product_id: item.id },
                    update: { $inc: { count: item.qty } },
                  },
                }
              })

              changeOrder(bulkOperations)

              // await ProductGroup.bulkWrite(bulkOperations)
              //   .then(async () => changeOrder())
              //   .catch(error => res.status(400).json({ success: false, message: error.message }))
            } else changeOrder()
          }
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
      .then(async response => {
        const bulkOperations = response.perfumes.map(item => {
          return {
            updateOne: {
              filter: { product_id: item.id },
              update: { $inc: { count: item.qty } },
            },
          }
        })

        await ProductGroup.bulkWrite(bulkOperations)
        if (response) res.status(200).json({ success: true, message: 'order_deleted' })
        else res.status(400).json({ success: false, message: 'order_not_found' })
      })
      .catch(error => res.status(400).json({ success: false, message: error.message }))
  }),
}

export default order
