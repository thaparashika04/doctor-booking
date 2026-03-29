import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import Doctor from "../models/doctorModel.js";
import jwt from "jsonwebtoken";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";

// ================= ADD DOCTOR =================
const addDoctor = async (req, res) => {
    try {

        console.log("BODY:", req.body);
        console.log("FILE:", req.file);

        // Check image first
        if (!req.file) {
            return res.json({ success: false, message: "Image is required" });
        }

        const requiredFields = [
            "name",
            "email",
            "password",
            "specialization",
            "degree",
            "experience",
            "about",
            "fee",
            "address"
        ];

        // Check missing fields one by one
        for (let field of requiredFields) {
            if (!req.body[field] || req.body[field].trim() === "") {
                return res.json({
                    success: false,
                    message: `${field} is required`
                });
            }
        }

        const {
            name,
            email,
            password,
            specialization,
            degree,
            experience,
            about,
            fee,
            address
        } = req.body;

        // Validate email
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Invalid email format" });
        }

        // Validate password
        if (password.length < 8) {
            return res.json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        // Check duplicate email BEFORE saving
        const existingDoctor = await Doctor.findOne({ email });
        if (existingDoctor) {
            return res.json({
                success: false,
                message: "Doctor with this email already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: "image"
        });

        // Parse address safely
        let parsedAddress;
        try {
            parsedAddress = JSON.parse(address);
        } catch (error) {
            return res.json({
                success: false,
                message: "Invalid address JSON format"
            });
        }

        const doctorData = {
            name,
            email,
            password: hashedPassword,
            image: result.secure_url,
            specialization,
            degree,
            experience: Number(experience),
            about,
            fee: Number(fee),
            address: parsedAddress,
            date: Date.now()
        };

        const newDoctor = new Doctor(doctorData);
        await newDoctor.save();

        return res.json({
            success: true,
            message: "Doctor added successfully"
        });

    } catch (error) {
        console.log("Error adding doctor:", error.message);
        return res.json({
            success: false,
            message: error.message
        });
    }
};

// ================= ADMIN LOGIN =================
const loginAdmin = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!process.env.JWT_SECRET) {
            return res.json({
                success: false,
                message: "JWT secret missing"
            });
        }

        if (
            email === process.env.ADMIN_EMAIL &&
            password === process.env.ADMIN_PASSWORD
        ) {
            const token = jwt.sign(
                { email },
                process.env.JWT_SECRET,
            );

            return res.json({
                success: true,
                message: "Admin logged in successfully",
                token
            });
        }

        return res.json({
            success: false,
            message: "Invalid email or password"
        });

    } catch (error) {
        console.log(error.message);
        return res.json({
            success: false,
            message: "Login failed"
        });
    }
};

//api to get all doctor list for admin dashboard
const allDoctors = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select('-password')
        res.json({
            success: true,
            doctors
        })
    } catch (error) {
        console.log(error.message);
        return res.json({
            success: false,
            message: error.message
        });
    }
}

//api to get all apointment list
const appointmentsAdmin = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({})
        res.json({
            success: true,
            appointments
        })
    } catch (error) {
        console.log(error.message);
        return res.json({
            success: false,
            message: error.message
        });
    }
}

// api for appointment cacellation

const appointmentCancel = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        const appointment = await appointmentModel.findById(appointmentId);
        

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        // Free slot
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

//api to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {
        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse().slice(0,5)
        }

        res.json({
            success: true,
            dashData
        })

    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}

export { addDoctor, loginAdmin, allDoctors, appointmentsAdmin, appointmentCancel, adminDashboard };