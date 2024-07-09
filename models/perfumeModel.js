import mongoose from 'mongoose'

const perfumeSchema = mongoose.Schema(
  {
    type: { type: String, required: true, enum: ['atir', 'mushkambar'] },
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
    purchase_price: { type: Number, required: true },
    sale_price: { type: Number, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    userId: { type: mongoose.Types.ObjectId, required: true, ref: 'user' },
  },
  { timestamps: true }
)

// perfumeSchema.post('save', async function (next) {
//   const user = this
//   console.log(user)
//   console.log(user.isModified)
//   console.log(user.isModified())
//   console.log(user.isModified('name'))

//   if (this.isModified('name')) {
//     this.slug = slugify(this.name, {
//       lower: true, // Kichik harflar
//       strict: true, // Maxsus belgilarni olib tashlash
//     })
//   }
//   next()
// })

export default mongoose.model('Perfume', perfumeSchema)
