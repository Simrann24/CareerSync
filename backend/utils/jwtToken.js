import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// User Schema definition
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false, // Do not return password by default in queries
  },
  role: {
    type: String,
    default: 'Job Seeker', // Default role is Job Seeker
  },
});

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to generate JWT Token
userSchema.methods.getJWTToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role }, // Payload: user id and role
    process.env.JWT_SECRET_KEY, // Secret key for signing JWT
    {
      expiresIn: process.env.JWT_EXPIRE || '1d', // JWT expiry time (default: 1 day)
    }
  );
};

// Method to compare passwords (for login)
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Export the User model
export const User = mongoose.model('User', userSchema);

