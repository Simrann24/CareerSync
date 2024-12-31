import { catchAsyncError } from './catchAsyncError.js';
import ErrorHandler from './error.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/userSchema.js';

export const isAuthorized = catchAsyncError(async (req, res, next) => {
  // Retrieve the token from cookies
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  // If no token is provided, send a 401 Unauthorized error
  if (!token) {
    return next(new ErrorHandler("User Not Authorized, Token Missing", 401));
  }

  try {
    // Verify the token using the JWT secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    // Add user to request object after finding the user by ID from the token
    req.user = await User.findById(decoded.id);

    // If user is not found, respond with an unauthorized error
    if (!req.user) {
      return next(new ErrorHandler("User Not Found", 404));
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // If token verification fails or is expired, send an appropriate error
    if (error.name === 'JsonWebTokenError') {
      return next(new ErrorHandler("Invalid Token", 400)); // Invalid token error
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ErrorHandler("Token Expired", 401)); // Token expired error
    }

    // Handle other unexpected errors
    return next(new ErrorHandler("Something went wrong during authorization", 500));
  }
});
