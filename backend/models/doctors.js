import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  address1: { type: String, required: true },  
  address2: { type: String, required: true },  
});

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, required: true },  
  speciality: { type: String, required: true },
  address: { type: addressSchema, required: true },  
  degree: { type: String, required: true },
  experience: { type: String, required: true },
  about: { type: String, required: true },
  available: { type: Boolean, default: true },
  fees: { type: Number, required: true },
  date: { type: Date, default: Date.now },  // Default to current date
  slot_booked: { type: Object, default: {} },  // Default to empty object for booked slots
}, { minimize: false });  
const doctorModel = mongoose.models.doctor || mongoose.model('Doctor', doctorSchema);

export default doctorModel;
