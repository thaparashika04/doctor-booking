import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const DoctorProfile = () => {
  const { dToken, profileData, setProfileData, getProfileData, backendUrl } = useContext(DoctorContext)
  const { currency } = useContext(AppContext)

  const [isEdit, setIsEdit] = useState(false)

  const updateProfile = async () => {
    try {
      const updateData = {
        address: profileData.address,
        fee: profileData.fee,
        available: profileData.available
      }

      const { data } = await axios.post(backendUrl + '/doctor/update-profile', updateData, {
        headers: { Authorization: `Bearer ${dToken}` }
      })

      if (data.success) {
        toast.success(data.message)
        setIsEdit(false)
        getProfileData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
      console.log(error)
    }
  }

  useEffect(() => {
    if (dToken) getProfileData()
  }, [dToken])

  // Return null until profileData is fully loaded
  if (!profileData) return null

  return (
    <div>
      <div className='flex flex-col gap-4 m-5'>

        <div>
          {profileData.image && profileData.image.trim() !== '' && (
            <img
              src={profileData.image}
              alt={profileData.name || 'Doctor'}
              className='bg-primary/80 w-full sm:max-w-64 rounded-lg'
            />
          )}
        </div>

        <div className='flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white'>
          {/* Doctor Info */}
          <p className='flex items-center gap-2 text-3xl font-medium text-gray-700'>{profileData.name || ''}</p>
          <div className='flex items-center gap-2 mt-1 text-gray-600'>
            <p className='m-0'>
              {profileData.degree || ''} - {profileData.specialization || ''}
            </p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>
              {profileData.experience ?? 0} {(profileData.experience ?? 0) === 1 ? 'year' : 'years'}
            </button>
          </div>

          {/* About */}
          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-neutral-800 mt-3'>About:</p>
            <p className='text-sm text-gray-600 max-w-175 mt-1'>{profileData.about || ''}</p>
          </div>

          {/* Appointment Fee */}
          <p className='text-gray-600 font-medium mt-4'>
            Appointment fee: <span className='text-gray-800'>
              {currency}{' '}
              {isEdit
                ? <input
                  type="number"
                  value={profileData.fee ?? 0}
                  onChange={(e) =>
                    setProfileData(prev => ({ ...prev, fee: Number(e.target.value) }))
                  }
                  className="border px-1 rounded w-20"
                />
                : profileData.fee ?? 0
              }
            </span>
          </p>

          {/* Address */}
          <div className='flex gap-2 py-2'>
            <p>Address:</p>
            <p className='text-sm'>
              {isEdit
                ? <input
                  type="text"
                  value={profileData.address?.line1 ?? ''}
                  onChange={(e) =>
                    setProfileData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))
                  }
                  className="border px-1 rounded w-full"
                />
                : profileData.address?.line1 ?? ''
              }
              <br />
              {isEdit
                ? <input
                  type="text"
                  value={profileData.address?.line2 ?? ''}
                  onChange={(e) =>
                    setProfileData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))
                  }
                  className="border px-1 rounded w-full mt-1"
                />
                : profileData.address?.line2 ?? ''
              }
            </p>
          </div>

          {/* Available Checkbox */}
          <div className='flex gap-1 pt-2 items-center'>
            <input
              type="checkbox"
              checked={profileData.available ?? false} // default false
              onChange={() => isEdit && setProfileData(prev => ({ ...prev, available: !prev.available }))}
              className='accent-blue-800 w-4 h-4'
            />
            <label>Available</label>
          </div>

          {/* Edit / Save Button */}
          {isEdit
            ? <button
              onClick={updateProfile}
              className='px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all'
            >
              Save
            </button>
            : <button
              onClick={() => setIsEdit(true)}
              className='px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all'
            >
              Edit
            </button>
          }
        </div>
      </div>
    </div>
  )
}

export default DoctorProfile