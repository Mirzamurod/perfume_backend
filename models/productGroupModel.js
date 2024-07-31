import mongoose from 'mongoose'

const productGroupSchema = mongoose.Schema(
  {
    sale_price: { type: Number, required: true, trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'users' },
    count: { type: Number, required: true, trim: true, min: [0, 'product_count_incorrect'] },
    product_id: { type: mongoose.Types.ObjectId, required: true, unique: true, ref: 'products' },
  },
  { timestamps: true }
)

export default mongoose.model('ProductGroup', productGroupSchema)
