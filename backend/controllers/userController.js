import { catchAsyncError } from '../middlewares/catchAsyncError.js';
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { sendToken } from "../utils/jwtToken.js";

export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, phone, role, password } = req.body;

  // Ensure all required fields are provided
  if (!name || !email || !phone || !role || !password) {
    return next(new ErrorHandler("Please fill the full registration form.", 400));
  }

  // Check if the email already exists in the database
  const isEmail = await User.findOne({ email });
  if (isEmail) {
    return next(new ErrorHandler("Email already exists. Please try with another email.", 400));
  }

  // Create a new user
  const user = await User.create({
    name,
    email,
    phone,
    role,
    password,
  });

  // Send token and response
  sendToken(user, 201, res, "User registered successfully!");
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password, role } = req.body;

  // Ensure that email, password, and role are provided
  if (!email || !password || !role) {
    return next(new ErrorHandler("Please provide email, password, and role.", 400));
  }

  // Check if the user exists
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or password.", 401));
  }

  // Validate password
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password.", 401));
  }

  // Ensure the role matches
  if (user.role !== role) {
    return next(new ErrorHandler(`User with role "${role}" not found.`, 404));
  }

  // Send token and response
  sendToken(user, 200, res, "User logged in successfully!");
});

export const logout = catchAsyncError(async (req, res, next) => {
  // Clear the token cookie to log the user out
  res.status(200).cookie("token", "", {
    httpOnly: true,
    expires: new Date(Date.now()), // Expire the token immediately
  }).json({
    success: true,
    message: "Logged out successfully.",
  });
});

export const getUser = catchAsyncError(async (req, res, next) => {
  const user = req.user;

  // Ensure that the user is found
  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  // Return the user details
  res.status(200).json({
    success: true,
    user,
  });
});
