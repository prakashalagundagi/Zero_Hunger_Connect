// User model — represents all user roles: donor, receiver, volunteer, ngo
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // Never return password in queries by default
    },
    role: {
      type: String,
      enum: ['donor', 'receiver', 'volunteer', 'ngo'],
      required: [true, 'Role is required'],
    },
    phone: {
      type: String,
      default: '',
    },
    location: {
      lat: { type: Number, default: 12.9716 },
      lng: { type: Number, default: 77.5946 },
      address: { type: String, default: '' },
    },
    avatar: {
      type: String,
      default: '', // Will be set to dicebear URL on creation
    },
    // Impact statistics — updated as user completes donations/deliveries
    impactStats: {
      mealsSaved: { type: Number, default: 0 },
      foodWasteReduced: { type: Number, default: 0 },
      peopleHelped: { type: Number, default: 0 },
      co2Reduced: { type: Number, default: 0 },
      donationsCompleted: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare plaintext password with hashed version
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
