import mongoose from 'mongoose'

const orderSchema = mongoose.Schema(
  {
    phone: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    location: { type: [Number], required: false, trim: true },
    delivery_date: { type: Date, required: false, trim: true },
    payment_method: { type: String, required: true, trim: true, enum: ['cash', 'card'] },
    address: { type: String, trim: true },
    status: {
      type: String,
      required: true,
      trim: true,
      enum: ['added', 'accepted', 'on_the_way', 'sold', 'cancelled'],
      default: 'added',
    },
    perfumes: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'products',
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
