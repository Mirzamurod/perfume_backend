import mongoose from 'mongoose'

const userSchema = mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mode: { type: String, required: true, enum: ['dark', 'light'], default: 'dark' },
    role: { type: String, required: true, enum: ['admin', 'client', 'supplier'] },
    userId: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'users' },
    block: { type: Boolean, require: true, default: false },
  },
  { timestamps: true }
)

export default mongoose.model('User', userSchema)
