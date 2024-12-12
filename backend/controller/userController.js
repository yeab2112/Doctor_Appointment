import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/user.js";
import mongoose from "mongoose";
import { v2 } from "cloudinary";
import doctorModel from "../models/doctors.js";
import Appointment from "../models/appointment.js";
import axios from 'axios';
// Register a new user
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // Validate input
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Missing required details" });
  }

  // Validate email
  if (!validator.isEmail(email)) {
    return res.status(400).json({ success: false, message: "Invalid email address" });
  }

  // Validate password length
  if (password.length < 8) {
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
  }

  try {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashPassword,
    };

    // Save user to the database
    const newUser = new userModel(userData);
    const user = await newUser.save();

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    console.error("Error during user registration:", error);
    return res.status(500).json({ success: false, message: "Failed to register user" });
  }
};

// User login
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User does not exist" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Error during user login:", error);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};

// Get user profile

const getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      console.log(userId)
      return res.status(400).json({ success: false, message: "User ID not provided" });
    }

    const user = await userModel.findById(userId).select("-password");
    if (!user) {
      console.log(user)
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, userData: user });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};



// Update user profile

const updateProfile = async (req, res) => {
  try {
    const { name, dob, phone, gender, address } = req.body;

    const image = req.file;
    const userId = req.userId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid or missing userId" });
    }

    // Validate other required fields
    if (!name || !dob || !phone || !gender || !address) {
      return res.status(400).json({ success: false, message: "Missing required details" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Handle image upload if provided
    let imageUrl = user.image; // Keep old image if not updating
    if (image) {
      const imageUpload = await v2.uploader.upload(image.path, { resource_type: "image" });
      imageUrl = imageUpload.secure_url; // Get new image URL
    }

    // Parse address if it's a string
    const parsedAddress = typeof address === "string" ? JSON.parse(address) : address;

    const updatedData = {
      name,
      dob,
      phone,
      gender,
      address: parsedAddress,
      image: imageUrl,
    };

    // Update user's profile
    const updatedUser = await userModel.findByIdAndUpdate(userId, updatedData, { new: true });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      userData: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
// book appintmment
const bookAppointment = async (req, res) => {
  try {
    const { docId, docDate, slotDate, date, userDate, slotTime } = req.body;
    const userId = req.userId;

    // Get doctor data
    const docData = await doctorModel.findById(docId).select('-password');
    if (!docData) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    if (!docData.available) {
      return res.json({ success: false, message: "Doctor is not available" });
    }

    // Check if the slot is available
    let slot_booked = docData.slot_booked;
    if (slot_booked[slotDate]) {
      if (slot_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: "Slot is not available" });
      } else {
        slot_booked[slotDate].push(slotTime);
      }
    } else {
      slot_booked[slotDate] = [slotTime];
    }

    // Get user data
    const userData = await userModel.findById(userId).select('-password');
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const appointmentData = {
      userId,
      docId,
      userDate,
      date,
      docDate,
      userName: userData.name, // Optional: Store specific fields for user
      docName: docData.name,   // Optional: Store specific fields for doctor
      amount: docData.fees,
      slotDate,
      slotTime,        // Selected time slot
      Date: new Date() // Current date
    };

    const newAppointment = new Appointment(appointmentData);
    await newAppointment.save();

    // Update the doctor's booked slots
    await doctorModel.findByIdAndUpdate(docId, { slot_booked });

    // Return success message
    return res.json({ success: true, message: "Appointment booked successfully" });

  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


const myAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    // Correct query to find appointments by userId and populate  doctor data
    const appointments = await Appointment.find({ userId })
      .populate('docId', 'name image speciality address date')

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ success: false, message: "No appointments found" });
    }

    return res.json({ success: true, appointments });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
const cancelAppointment = async (req, res) => {
  try {
    // Ensure userId is extracted correctly
    const userId = req.userId; // Assuming this is set by middleware
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    // Correct destructuring and validation
    const { appointmentId } = req.body;
    if (!appointmentId) {
      return res.status(400).json({ success: false, message: "Appointment ID is required" });
    }

    // Fetch appointment data
    const appointmentData = await Appointment.findById(appointmentId);
    if (!appointmentData) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // Verify user authorization
    if (appointmentData.userId !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized action" });
    }

    // Update appointment to canceled
    await Appointment.findByIdAndUpdate(appointmentId, { cancelled: true });

    // Extract necessary data
    const { slotDate, slotTime, docId } = appointmentData;

    // Update doctor's slot data
    const docData = await doctorModel.findById(docId);
    if (!docData) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const slotBooked = docData.slot_booked || {};
    if (slotBooked[slotDate]) {
      slotBooked[slotDate] = slotBooked[slotDate].filter((time) => time !== slotTime);
    }

    await doctorModel.findByIdAndUpdate(docId, { slot_booked: slotBooked });

    // Respond with success
    res.json({ success: true, message: "Appointment canceled" });
  } catch (error) {
    console.error("Error in cancelAppointment:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Chapa API endpoint


const CHAPA_API_URL = 'https://api.chapa.co/v1/transaction/initialize';
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;

const initiateAppointmentPayment = async (req, res) => {
  const { appointmentId } = req.body;

  try {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const paymentData = {
      amount: appointment.amount * 100, // Convert to cents if necessary
      currency: 'ETB',
      tx_ref: `APPT-${appointment._id}-${Date.now()}`,
      return_url: 'http://localhost:3000/paymentSuccess',
      callback_url: 'http://localhost:5001/api/user/verify-payment',
      customization: {
        title: 'Doctor Appointment',
        description: `Payment for appointment on ${appointment.date}`,
      },
      meta: {
        phone: appointment.phoneNumber,
        appointment_date: appointment.date,
      },
    };

    const response = await axios.post(CHAPA_API_URL, paymentData, {
      headers: {
        Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.data.status === 'success') {
      res.status(200).json({
        success: true,
        checkoutUrl: response.data.data.checkout_url,
      });
    } else {
      res.status(400).json({
        success: false,
        message: response.data.message,
      });
    }
  } catch (error) {
    console.error('Error initiating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Payment initiation failed',
      error: error.message,
    });
  }
};

const verifyAppointmentPayment = async (req, res) => {
  const { txRef, appointmentId } = req.body;

  if (!txRef) {
    return res.status(400).json({ message: 'tx_ref is required' });
  }

  if (!appointmentId) {
    return res.status(400).json({ message: 'appointmentId is required' });
  }

  try {
    const response = await axios.get(`https://api.chapa.co/v1/transaction/verify/${txRef}`, {
      headers: {
        Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
      },
    });

    if (response.data.status === 'success') {
      const appointment = await Appointment.findById(appointmentId);

      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      appointment.payment = true;
      await appointment.save();

      res.status(200).json({
        status: 'success',
        data: response.data.data,
      });
    } else {
      res.status(400).json({
        status: 'fail',
        message: 'Payment verification failed',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during payment verification',
      error: error.message,
    });
  }
};



export { registerUser, userLogin, getProfile, updateProfile, bookAppointment, myAppointment, cancelAppointment ,initiateAppointmentPayment, verifyAppointmentPayment};
