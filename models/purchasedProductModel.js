import mongoose from 'mongoose'

const purchasedProductSchema = mongoose.Schema(
  {
    count: { type: Number, required: true, trim: true },
    purchased_price: { type: Number, required: true, trim: true },
    sale_price: { type: Number, required: true, trim: true },
    product_id: { type: mongoose.Types.ObjectId, required: true, ref: 'products' },
    userId: { type: mongoose.Types.ObjectId, required: true, ref: 'users' },
  },
  { timestamps: true }
)

export default mongoose.model('PurchasedProduct', purchasedProductSchema)
