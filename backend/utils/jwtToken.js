export const sendToken = (user, statusCode, res, message) => {
    const token = user.getJWTToken();
    const options = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true, // Prevent XSS attacks
        secure: process.env.NODE_ENV === 'production', // Secure cookies in production
        sameSite: 'Lax', // Ensure CSRF protection
    };

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        user,
        message,
        token,
    });
};
