import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, default: "Untitled Project" },
  property: { type: String },
  sqft: { type: Number },
  config: { type: String },
  location: { type: String },
  status: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' },
  customId: { type: String, unique: true },
  total: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  discountPct: { type: Number, default: 0 },
  rooms: { type: mongoose.Schema.Types.Mixed, default: {} }, // Nested rooms data
  items: { type: Array, default: [] }
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
