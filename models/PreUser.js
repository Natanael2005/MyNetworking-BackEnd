import mongoose from 'mongoose';

const preUserSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  lastName:   { type: String, required: true },
  email:      { type: String, required: true, unique: true },
  phoneNumber:{ type: String },
  jobTitle:   { type: String },
  createdAt:  { type: Date, default: Date.now }
});

preUserSchema.index({ createdAt: 1 }, { expires: '24h' });

export default mongoose.model('PreUser', preUserSchema);
