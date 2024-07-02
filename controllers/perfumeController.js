import expressAsyncHandler from 'express-async-handler'
import Perfume from './../models/perfumeModel.js'
import { validationResult } from 'express-validator'
import slugify from 'slugify'

const slug = name => slugify(name, { lower: true, strict: true })

const perfume = {
  /**
   * @desc    Get Perfumes
   * @route   GET /api/perfume
   * @access  Private
   */
  getPerfumes: expressAsyncHandler(async (req, res) => {
    const { limit, page, sortName, sortValue, search, searchName } = req.query
    if (+limit && +page) {
      const perfumes = await Perfume.find({
        userId: req.user.id,
        ...(searchName
          ? { [searchName]: { $regex: search ?? '', $options: 'i' } }
          : { name: { $regex: search ?? '', $options: 'i' } }),
      })
        .sort(sortValue ? { [sortName]: sortValue } : sortName)
        .limit(+limit)
        .skip(+limit * (+page - 1))

      const pageLists = Math.ceil((await Perfume.find({ userId: req.user.id })).length / limit)

      res.status(200).json({ data: perfumes, pageLists, page, count: perfumes.length })
    } else {
      const perfumes = await Perfume.find({
        userId: req.user.id,
        ...(searchName
          ? { [searchName]: { $regex: search ?? '', $options: 'i' } }
          : { name: { $regex: search ?? '', $options: 'i' } }),
      }).sort(sortValue ? { [sortName]: sortValue } : sortName)
      res.status(200).json({ data: perfumes })
    }
  }),

  /**
   * @desc    Get Perfume
   * @route   GET /api/perfume/:id
   * @access  Private
   */
  getPerfume: expressAsyncHandler(async (req, res) => {
    await Perfume.findById(req.params.id)
      .then(response => {
        if (response) res.status(200).json({ data: response })
        else res.status(400).json({ message: 'perfume_not_found', success: false })
      })
      .catch(error => res.status(400).json({ success: false, message: error.message }))
  }),

  /**
   * @desc    Add Perfume
   * @route   POST /api/perfume
   * @access  Private
   */
  addPerfume: expressAsyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ messages: errors.array(), success: false })
    }

    const { name } = req.body

    await Perfume.findOne({ name, userId: req.user.id })
      .then(async response => {
        if (response)
          res
            .status(400)
            .json({ success: false, messages: [{ msg: 'perfume_already_exists', path: 'name' }] })
        else {
          await Perfume.create({ ...req.body, userId: req.user.id, slug: slug(req.body.name) })
            .then(response => {
              if (response) res.status(201).json({ message: 'perfume_added', success: true })
            })
            .catch(error => res.status(400).json({ message: error.message, success: false }))
        }
      })
      .catch(error => res.status(400).json({ message: error.message, success: false }))
  }),

  /**
   * @desc    Edit Perfume
   * @route   PUT /api/perfume/:id
   * @access  Private
   */
  editPerfume: expressAsyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ messages: errors.array(), success: false })
    }

    await Perfume.findById(req.params.id)
      .then(async response => {
        if (!response) res.status(400).json({ success: false, message: 'perfume_not_found' })
        else {
          await Perfume.findByIdAndUpdate(
            req.params.id,
            { ...req.body, slug: slug(req.body.name) },
            { new: true }
          )
            .then(() => res.status(200).json({ success: true, message: 'perfume_updated' }))
            .catch(error => res.status(400).json({ success: false, message: error.message }))
        }
      })
      .catch(error => res.status(400).json({ message: error.message, success: false }))
  }),

  /**
   * @desc    Delete Perfume
   * @route   DELETE /api/perfume/:id
   * @access  Private
   */
  deletePerfume: expressAsyncHandler(async (req, res) => {
    await Perfume.findByIdAndDelete(req.params.id)
      .then(response => {
        if (response) res.status(200).json({ success: true, message: 'perfume_deleted' })
        else res.status(400).json({ success: false, message: 'perfume_not_found' })
      })
      .catch(error => res.status(400).json({ success: false, message: error.message }))
  }),
}

export default perfume
