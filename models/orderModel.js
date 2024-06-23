import mongoose from 'mongoose'

const orderSchema = mongoose.Schema(
  {
    phone: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    location: { type: String, required: false, trim: true },
    perfumes: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'perfumes',
        },
        qty: { type: Number, required: true, default: 1 },
      },
    ],
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'users' },
    supplierId: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'user' },
  },
  { timestamps: true }
)

export default mongoose.model('Order', orderSchema)
