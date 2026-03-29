import { useState, createContext } from "react";
import axios from 'axios'
import {toast} from 'react-toastify'

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKENDURL;

    const [dToken, setDToken] = useState(
        localStorage.getItem("dToken") || ''
    );

    const [appointments, setAppointments] = useState([])
    const [dashData, setDashData] = useState(false)
    
    // ✅ Corrected: initialize profileData with full object and safe defaults
    const [profileData, setProfileData] = useState({
        fees: 0,
        address: { line1: '', line2: '' },
        available: false,
        experience: 0,
        degree: '',
        specialization: '',
        about: '',
        image: '',
        name: ''
    })

    const getAppointments = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/doctor/appointments', {
                headers: { Authorization: `Bearer ${dToken}` }
            })
            if (data.success) {
                setAppointments(data.appointments)
                console.log(data.appointments);
                
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message)
            
        }
    }

    const completeAppointment = async (appointmentId) => {
        try {
            const {data} = await axios.post(backendUrl + '/doctor/complete-appointment',{appointmentId},{
                 headers: { Authorization: `Bearer ${dToken}` }
            })
            if (data.success) {
                toast.success(data.message)
                getAppointments()
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message)
        }
    }

    const cancelAppointment = async (appointmentId) => {
        try {
            const {data} = await axios.post(backendUrl + '/doctor/cancel-appointment',{appointmentId},{
                 headers: { Authorization: `Bearer ${dToken}` }
            })
            if (data.success) {
                toast.success(data.message)
                getAppointments()
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message)
        }
    }

    const getDashData = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/doctor/dashboard', {
                 headers: { Authorization: `Bearer ${dToken}` }
            })
            if (data.success) {
                setDashData(data.dashData)
                console.log(data.dashData);
                
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message)
        }
    }

    const getProfileData = async () => {
        try {
            const {data} = await axios.get(backendUrl +'/doctor/profile', {
                 headers: { Authorization: `Bearer ${dToken}` }
            })
            if (data.success) {
                setProfileData(data.profileData)
                console.log(data,profileData);
                
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message)
        }
    }
    

    const value = {
        dToken,
        setDToken,
        backendUrl,
        appointments,
        setAppointments,
        getAppointments,
        completeAppointment,
        cancelAppointment,
        dashData,
        setDashData,
        getDashData,
        profileData,
        setProfileData,
        getProfileData
    };

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    );
};

export default DoctorContextProvider;