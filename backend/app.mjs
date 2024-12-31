import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import fs from 'fs';
import userRouter from './routes/userRouter.js';
import applicationRouter from './routes/applicationRouter.js';
import jobRouter from './routes/jobRouter.js';
import { dbConnection } from './database/dbConnection.js';
import { errorMiddleware } from './middlewares/error.js';

const app = express();
dotenv.config({ path: './config/config.env' });

// Ensure /temp directory exists for file uploads
if (!fs.existsSync('./temp')) {
    fs.mkdirSync('./temp');
}

// CORS setup
app.use(cors({
    origin: [process.env.FRONTENED_URL],
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
    credentials: true,
}));

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: './temp/',
}));

// Logging cookies and headers for debugging
app.use((req, res, next) => {
    console.log('Incoming Cookies:', req.cookies);
    console.log('Authorization Header:', req.headers.authorization);
    next();
});

// Routes
app.use('/api/v1/user', userRouter);
app.use('/api/v1/application', applicationRouter);
app.use('/api/v1/job', jobRouter);

// Database connection
dbConnection();

// Error Middleware
app.use(errorMiddleware);

export default app;
