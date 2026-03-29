import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [paying, setPaying] = useState(false);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const slotDateFormat = (slotDate) => {
    if (!slotDate) return "Invalid Date";
    const date = new Date(slotDate);
    if (isNaN(date)) return "Invalid Date";
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/user/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setAppointments(data.appointments.reverse());
    } catch (error) {
      console.error(error);
      toast.error("Failed to load appointments");
    }
  };

  const cancelAppointment = async (id) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/user/cancel-appointment`,
        { appointmentId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData();
      } else toast.error(data.message);
    } catch (error) {
      console.error(error);
      toast.error("Cancel failed");
    }
  };

  const openPaymentModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const handleDummyPayment = async () => {
    if (!selectedAppointment) return;
    setPaying(true);
    try {
      const { data } = await axios.post(
        backendUrl + '/user/payment-dummy',
        { appointmentId: selectedAppointment._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(`Payment of Rs.${selectedAppointment.amount} successful! ✅`);
        setShowModal(false);
        setSelectedAppointment(null);
        getUserAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Payment failed. Please try again.");
    }
    setPaying(false);
  };

  useEffect(() => { if (token) getUserAppointments(); }, [token]);

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">My Appointments</p>
      <div>
        {appointments.map((item, idx) => (
          <div key={idx} className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b">
            <div><img className="w-32 bg-indigo-50" src={item.docData.image} alt="" /></div>
            <div className="flex-1 text-sm text-zinc-600">
              <p className="text-neutral-800 font-semibold">{item.docData.name}</p>
              <p>{item.docData.specialization}</p>
              <p className="text-zinc-700 font-medium mt-1">Address:</p>
              <p className="text-xs">{item.docData.address.line1}</p>
              <p className="text-xs">{item.docData.address.line2}</p>
              <p className="text-sm mt-1">
                <span className="text-sm text-neutral-700 font-medium">Date & Time:</span>{" "}
                {slotDateFormat(item.slotDate)} | {item.slotTime}
              </p>
            </div>
            <div className="flex flex-col gap-2 justify-end">
              {!item.cancelled ? (
                <>
                  {item.isCompleted ? (
                    <button className="text-sm text-green-500 sm:min-w-48 py-2 border border-green-500 rounded cursor-not-allowed">
                      Completed
                    </button>
                  ) : item.payment ? (
                    <button className="text-sm text-green-500 sm:min-w-48 py-2 border border-green-500 rounded cursor-not-allowed">
                      Completed
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => openPaymentModal(item)}
                        className="text-sm text-stone-500 sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300">
                        Pay Online
                      </button>
                      <button
                        onClick={() => cancelAppointment(item._id)}
                        className="text-sm text-stone-500 sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300">
                        Cancel Appointment
                      </button>
                    </>
                  )}
                </>
              ) : (
                <button className="text-sm text-red-500 sm:min-w-48 py-2 border border-red-500 rounded cursor-not-allowed">
                  Cancelled
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dummy Payment Modal */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-zinc-800 mb-1">Payment</h2>
            <p className="text-sm text-zinc-500 mb-6">Complete your appointment payment</p>

            {/* Summary */}
            <div className="bg-zinc-50 rounded-xl p-4 mb-6 text-sm text-zinc-600 flex flex-col gap-1">
              <div className="flex justify-between">
                <span>Doctor</span>
                <span className="font-medium text-zinc-800">{selectedAppointment.docData.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Date</span>
                <span className="font-medium text-zinc-800">{slotDateFormat(selectedAppointment.slotDate)}</span>
              </div>
              <div className="flex justify-between">
                <span>Time</span>
                <span className="font-medium text-zinc-800">{selectedAppointment.slotTime}</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-1">
                <span className="font-semibold text-zinc-700">Total Amount</span>
                <span className="font-bold text-zinc-900">Rs.{selectedAppointment.amount}</span>
              </div>
            </div>

            {/* Fake Card UI */}
            <div className="border rounded-xl p-4 mb-4 flex flex-col gap-3">
              <div>
                <label className="text-xs text-zinc-500">Card Number</label>
                <input
                  type="text"
                  defaultValue="4242 4242 4242 4242"
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1 text-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary"
                  readOnly
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-zinc-500">Expiry</label>
                  <input
                    type="text"
                    defaultValue="12/26"
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1 text-zinc-700 focus:outline-none"
                    readOnly
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-zinc-500">CVV</label>
                  <input
                    type="text"
                    defaultValue="123"
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1 text-zinc-700 focus:outline-none"
                    readOnly
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-400 text-center mb-4">🔒 This is a demo payment — no real money is charged</p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowModal(false); setSelectedAppointment(null); }}
                className="flex-1 py-2 border rounded-lg text-sm text-zinc-600 hover:bg-zinc-50 transition-all">
                Cancel
              </button>
              <button
                onClick={handleDummyPayment}
                disabled={paying}
                className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all disabled:opacity-60">
                {paying ? "Processing..." : `Pay Rs.${selectedAppointment.amount}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;