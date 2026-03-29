import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";

// ---------------- User Auth ---------------- //

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Please fill all the fields" });
        }
        if (!validator.isEmail(email)) return res.status(400).json({ success: false, message: "Invalid email" });
        if (password.length < 8) return res.status(400).json({ success: false, message: "Password too short" });

        const normalizedEmail = email.trim().toLowerCase();
        if (await userModel.findOne({ email: normalizedEmail })) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await userModel.create({ name, email: normalizedEmail, password: hashedPassword });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({ success: true, message: "User registered", token });
    } catch (error) {
        console.error("registerUser:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) return res.json({ success: false, message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.json({ success: false, message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({ success: true, token, message: "Login successful" });
    } catch (error) {
        console.error("loginUser:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ---------------- User Profile ---------------- //

const getProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, userData: user });
    } catch (error) {
        console.error("getProfile:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = {};
        const { name, phone, address, dob, gender } = req.body;

        if (name) updates.name = name;
        if (phone) updates.phone = phone;
        if (dob) updates.dob = dob;
        if (gender) updates.gender = gender;
        if (address) updates.address = typeof address === "string" ? JSON.parse(address) : address;

        if (req.file) {
            const uploadResult = await cloudinary.uploader.upload(req.file.path, { resource_type: "image" });
            updates.image = uploadResult.secure_url;
        }

        const updatedUser = await userModel.findByIdAndUpdate(userId, updates, { new: true }).select("-password");
        res.json({ success: true, message: "Profile updated", user: updatedUser });
    } catch (error) {
        console.error("updateProfile:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ---------------- Appointments ---------------- //

const bookAppointment = async (req, res) => {
    try {
        const userId = req.user.id;
        let { docId, slotDate, slotTime } = req.body;

        if (slotDate.includes("_")) {
            const [day, month, year] = slotDate.split("_").map(Number);
            slotDate = new Date(year, month - 1, day).toISOString().split("T")[0];
        }

        const doc = await doctorModel.findById(docId).select("-password");
        if (!doc.available) return res.json({ success: false, message: "Doctor not available" });

        const slotsBooked = doc.slots_booked || {};
        if (slotsBooked[slotDate]?.includes(slotTime)) return res.json({ success: false, message: "Slot not available" });
        slotsBooked[slotDate] = slotsBooked[slotDate] ? [...slotsBooked[slotDate], slotTime] : [slotTime];

        const userData = await userModel.findById(userId).select("-password");
        const appointment = new appointmentModel({
            userId,
            docId,
            userData,
            docData: { ...doc.toObject(), slots_booked: undefined },
            amount: doc.fee,
            slotTime,
            slotDate,
            date: Date.now(),
        });
        await appointment.save();
        await doctorModel.findByIdAndUpdate(docId, { slots_booked: slotsBooked });

        res.json({ success: true, message: "Appointment booked" });
    } catch (error) {
        console.error("bookAppointment:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const listAppointment = async (req, res) => {
    try {
        const userId = req.user.id;
        const appointments = await appointmentModel.find({ userId }).sort({ date: -1 });
        res.json({ success: true, appointments });
    } catch (error) {
        console.error("listAppointment:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const cancelAppointment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { appointmentId } = req.body;

        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });
        if (appointment.userId.toString() !== userId) return res.status(403).json({ success: false, message: "Unauthorized" });

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        const doc = await doctorModel.findById(appointment.docId);
        if (doc?.slots_booked?.[appointment.slotDate]) {
            doc.slots_booked[appointment.slotDate] = doc.slots_booked[appointment.slotDate].filter(e => e !== appointment.slotTime);
            await doctorModel.findByIdAndUpdate(appointment.docId, { slots_booked: doc.slots_booked });
        }

        res.json({ success: true, message: "Appointment cancelled" });
    } catch (error) {
        console.error("cancelAppointment:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ---------------- Dummy Payment ---------------- //

const paymentDummy = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const appointment = await appointmentModel.findById(appointmentId);

        if (!appointment || appointment.cancelled) {
            return res.json({ success: false, message: "Appointment not found or cancelled" });
        }
        if (appointment.payment) {
            return res.json({ success: false, message: "Already paid" });
        }

        // Mark as paid and log payment in backend
        await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true });

        console.log("💰 PAYMENT RECEIVED:");
        console.log(`   Appointment ID : ${appointmentId}`);
        console.log(`   Patient        : ${appointment.userData.name}`);
        console.log(`   Doctor         : ${appointment.docData.name}`);
        console.log(`   Amount         : Rs.${appointment.amount}`);
        console.log(`   Date & Time    : ${appointment.slotDate} at ${appointment.slotTime}`);
        console.log(`   Paid At        : ${new Date().toLocaleString()}`);

        res.json({ success: true, message: "Payment successful", amount: appointment.amount });
    } catch (error) {
        console.error("paymentDummy:", error.message);
        res.json({ success: false, message: error.message });
    }
};

export {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    bookAppointment,
    listAppointment,
    cancelAppointment,
    paymentDummy,
};