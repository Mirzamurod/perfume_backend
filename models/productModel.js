import mongoose from 'mongoose'

const productSchema = mongoose.Schema(
  {
    type: { type: String, required: true, enum: ['perfume', 'muskambar'] },
    name: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    smell: { type: String, required: true, trim: true },
    season: {
      type: String,
      required: true,
      trim: true,
      enum: ['winter' , 'spring' , 'summer' , 'autumn'],
    },
    gender: { type: String, required: true, enum: ['boy', 'girl'] },
    persistence_of_the_smell: { type: Number, required: true, default: 1, trim: true },
    slug: { type: String, required: true, trim: true },
    userId: { type: mongoose.Types.ObjectId, required: true, ref: 'users' },
  },
  { timestamps: true }
)

export default mongoose.model('Product', productSchema)
