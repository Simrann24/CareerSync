export const sendToken = (user, statusCode, res, message) => {
  const token = user.getJWTToken(); // Generate JWT Token

  const options = {
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000), // Token expiration
    httpOnly: false, // Allows JavaScript to access the cookie (use false for testing purposes)
    secure: process.env.NODE_ENV === 'production', // Only set 'secure' flag in production (for HTTPS)
    sameSite: 'strict', // Protects from CSRF
  };

  // Send response with token as cookie
  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    user,
    message,
    token, // The token is also included in the response body
  });
};

