import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import connectCloudinary from './config/cloudinary.js'; 

import adminRout from './routers/addminRout.js'; 
import dotenv from 'dotenv';
import doctorRoutes from './routers/doctorRout.js';
import userRoutes from './routers/userRout.js';

dotenv.config(); // Load environment variables

// Create express app
const app = express();

// Connect DB & Cloudinary
connectDB();
connectCloudinary();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/admin', adminRout);
app.use('/api/doctor', doctorRoutes);
app.use('/api/user', userRoutes);

// ❗ IMPORTANT for Vercel — DO NOT USE app.listen()
// ❗ Instead export the app

export default app;
