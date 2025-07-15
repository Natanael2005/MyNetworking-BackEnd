import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name:                  { type: String, required: true },
  lastName:              { type: String, required: true },
  email:                 { type: String, required: true, unique: true },
  phoneNumber:           { type: String },
  jobTitle:              { type: String },
  firebase_uid:          { type: String, default: null },
  stripe_id:             { type: String, default: null },
  stripeSubscriptionId:  { type: String, default: null },
  estado: {
    type: String,
    enum: ['draft','pago_realizado','registered','hoja_completa'],
    default: 'draft'
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
