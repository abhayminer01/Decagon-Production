import mongoose from 'mongoose';

const adminDataSchema = new mongoose.Schema({
  singletonId: { type: String, default: 'admin_data', unique: true },
  services: { type: Array, default: [] },
  finishings: { type: Array, default: [] },
  coreMaterials: { type: Array, default: [] },
  accessories: { type: Array, default: [] },
  rooms: { type: mongoose.Schema.Types.Mixed, default: {} },
  bootstrapData: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('AdminData', adminDataSchema);
