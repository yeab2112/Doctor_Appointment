import express from 'express'
import { addDoctor ,adminLogin,allDoctors,appintmmentAdmin,appointmentCancel,adminDashboard} from '../controller/adminController.js'
import authoAdmin from '../middleware/authAdmin.js'
import upload from '../middleware/multer.js'
import { changeAvlablity } from '../controller/doctorController.js'
 const adminRout=express.Router()
 adminRout.post("/add-doctor", authoAdmin, upload.single('docImg'), addDoctor);
 adminRout.post("/login",adminLogin)
 adminRout.get('/all-doctor',authoAdmin, allDoctors);
 adminRout.post('/change-available',authoAdmin, changeAvlablity);
 adminRout.get('/get-appointment',authoAdmin, appintmmentAdmin);
 adminRout.post('/appointment-cancel',authoAdmin, appointmentCancel);
 adminRout.get('/dashboard',authoAdmin, adminDashboard);

 export default adminRout;