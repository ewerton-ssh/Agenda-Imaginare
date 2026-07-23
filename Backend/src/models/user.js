const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  tokenVersion: { type: Number, default: 0 },
  admin: { type: Boolean, required: true, default: false },
  loginAttempts: { type: Number, default: 0 },
  loginBlockedUntil: { type: Date, default: null},
  recoveryCode: { type: String, default: null, select: false },
  recoveryExpires: { type: Date, default: null, select: false},
  lastRecoveryRequest: { type: Date, default: null, index: true },
  recoveryAttempts: { type: Number, default: 0 }
}, {
  timestamps: true
});

const collection = 'users';

const User = mongoose.model('User', userSchema, collection);

module.exports = { User };