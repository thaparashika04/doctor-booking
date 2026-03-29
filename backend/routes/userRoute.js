import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentDummy,
} from "../controllers/userController.js";

import authUser from "../middleware/authUser.js";
import upload from "../middleware/multer.js";

const userRouter = express.Router();

// Auth
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);

// Profile
userRouter.get('/get-profile', authUser, getProfile);
userRouter.put('/update-profile', authUser, upload.single("image"), updateProfile);

// Appointments
userRouter.post('/book-appointment', authUser, bookAppointment);
userRouter.get('/appointments', authUser, listAppointment);
userRouter.post('/cancel-appointment', authUser, cancelAppointment);

// Dummy Payment
userRouter.post('/payment-dummy', authUser, paymentDummy);

export default userRouter;