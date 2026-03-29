import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import RelatedDoctors from '../components/RelatedDoctors';
import { toast } from 'react-toastify';
import axios from 'axios';

const Appointment = () => {
  const { docId } = useParams()
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } = useContext(AppContext)
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const navigate = useNavigate()
  const [docInfo, setDocInfo] = useState(null)
  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')

  const fetchDocInfo = async () => {
    const info = doctors.find(doc => doc._id === docId)
    setDocInfo(info)
  }

  const getAvailableSlots = () => {
    if (!docInfo) return
    setDocSlots([])

    let today = new Date()
    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)
      let endTime = new Date(today)
      endTime.setDate(today.getDate() + i)
      endTime.setHours(21, 0, 0, 0)

      currentDate.setHours(i === 0 && today.getHours() > 10 ? today.getHours() + 1 : 10)
      currentDate.setMinutes(i === 0 && today.getMinutes() > 30 ? 30 : 0)

      let timeSlots = []

      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        let year = currentDate.getFullYear()
        let month = String(currentDate.getMonth() + 1).padStart(2, '0')
        let day = String(currentDate.getDate()).padStart(2, '0')

        // ✅ Use ISO format for backend
        const slotDate = `${year}-${month}-${day}`

        const isSlotAvailable = !docInfo.slots_booked?.[slotDate]?.includes(formattedTime)
        if (isSlotAvailable) {
          timeSlots.push({ datetime: new Date(currentDate), time: formattedTime, slotDate })
        }

        currentDate.setMinutes(currentDate.getMinutes() + 30)
      }

      setDocSlots(prev => [...prev, timeSlots])
    }
  }

  const bookAppointment = async () => {
    if (!token) {
      toast.warn('Login to book appointment')
      return navigate('/login')
    }

    try {
      const selectedSlot = docSlots[slotIndex][0]
      if (!selectedSlot) return toast.error("Please select a valid slot")

      const { slotDate } = selectedSlot
      const { data } = await axios.post(
        backendUrl + '/user/book-appointment',
        { docId, slotDate, slotTime },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        toast.success(data.message)
        getDoctorsData()
        navigate('/my-appointments')
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => { fetchDocInfo() }, [doctors, docId])
  useEffect(() => { getAvailableSlots() }, [docInfo])

  return docInfo && (
    <div className='mt-4 sm:mt-8'>
      <div className='flex flex-col sm:flex-row gap-6 items-start'>
        <div><img className='bg-primary w-full sm:w-72 h-72 object-cover rounded-lg' src={docInfo?.image} alt="" /></div>
        <div className='flex-1 border border-gray-300 rounded-lg p-8 bg-white'>
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>
            {docInfo?.name} <img className='w-5' src={assets.verified_icon} alt="" />
          </p>
          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{docInfo?.degree} - {docInfo?.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo?.experience}</button>
          </div>
          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>About <img src={assets.info_icon} alt="" /></p>
            <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{docInfo?.about}</p>
          </div>
          <p className='text-gray-500 font-medium mt-4'>
            Appointment fee: <span className='text-gray-600'>{currencySymbol}{docInfo?.fee ?? 0}</span>
          </p>
        </div>
      </div>

      <div className='sm:ml-72 sm:pl-8 font-medium text-gray-700'>
        <p>Booking slots</p>
        <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
          {docSlots.length > 0 && docSlots.map((slotArr, idx) => (
            <div onClick={() => setSlotIndex(idx)} className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === idx ? 'bg-primary text-white' : 'border border-gray-200'}`} key={idx}>
              <p>{slotArr[0] && daysOfWeek[slotArr[0].datetime.getDay()]}</p>
              <p>{slotArr[0] && slotArr[0].datetime.getDate()}</p>
            </div>
          ))}
        </div>
        <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
          {docSlots.length > 0 && docSlots[slotIndex].map((slot, idx) => (
            <p onClick={() => setSlotTime(slot.time)} className={`text-sm font-light shrink-0 px-5 py-2 rounded-full cursor-pointer ${slot.time === slotTime ? 'bg-primary text-white' : 'text-gray-400 border border-gray-300'}`} key={idx}>
              {slot.time.toLowerCase()}
            </p>
          ))}
        </div>
        <button onClick={bookAppointment} className='bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6'>Book an Appointment</button>
      </div>

      <RelatedDoctors docId={docId} specialization={docInfo?.specialization} />
    </div>
  )
}

export default Appointment