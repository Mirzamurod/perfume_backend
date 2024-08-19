import mongoose from 'mongoose'

const settingSchema = mongoose.Schema(
  {
    botId: { type: String, required: true, trim: true },
    groupId: { type: String, required: true, trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'users' },
  },
  { timestamps: true }
)

export default mongoose.model('Setting', settingSchema)
