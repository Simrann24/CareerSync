import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Define User Schema
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
  },
  role: {
    type: String,
    default: "Job Seeker", // Default role can be 'Job Seeker' or 'Employer'
  },
});

// Method to generate JWT Token
userSchema.methods.getJWTToken = function () {
  return jwt.sign(
    { id: this._id }, // Payload (user id)
    process.env.JWT_SECRET_KEY, // JWT Secret Key
    {
      expiresIn: process.env.JWT_EXPIRE || "1d", // Default expiration time
    }
  );
};

export const User = mongoose.model("User", userSchema);
