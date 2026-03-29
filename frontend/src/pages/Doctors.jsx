import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext';

const Doctors = () => {
  const { speciality } = useParams();
  const [filterDoc, setfilterDoc] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const { doctors } = useContext(AppContext);

  const applyFilter = () => {
    if (speciality) {
      setfilterDoc(
        doctors.filter(
          doc =>
            doc.specialization?.toLowerCase().trim() ===
            speciality?.toLowerCase().trim()
        )
      );
    } else {
      setfilterDoc(doctors);
    }
  };

  useEffect(() => {
    applyFilter();
  }, [speciality, doctors]);

  return (
    <div>
      <p className='text-gray-600'>Browse through the doctors specialist.</p>

      <div className='grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-10 mt-5'>
        <button className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${showFilters ? 'bg-primary text-white' : ''}`} onClick={() => setShowFilters(prev => !prev)}>Filters</button>
        {/* Left Filter */}
        <div className={`flex-col gap-3 text-sm text-gray-600 w-full ${showFilters ? 'flex' : 'hidden sm:flex'}`}>
          <p onClick={() => speciality === 'General physician' ? navigate('/doctors') : navigate('/doctors/General physician')} className={`w-full sm:w-[200px] pl-3 py-2 pr-6 border border-gray-300 rounded-md cursor-pointer transition-all ${speciality === "General physician" ? "bg-indigo-100 text-black" : ""}`}>General physician</p>

          <p onClick={() => speciality === 'Gynecologist' ? navigate('/doctors') : navigate('/doctors/Gynecologist')} className={`w-full sm:w-[200px] pl-3 py-2 pr-6 border border-gray-300 rounded-md cursor-pointer transition-all ${speciality === "Gynecologist" ? "bg-indigo-100 text-black" : ""}`}>Gynecologist</p>

          <p onClick={() => speciality === 'Dermatologist' ? navigate('/doctors') : navigate('/doctors/Dermatologist')} className={`w-full sm:w-[200px] pl-3 py-2 pr-6 border border-gray-300 rounded-md cursor-pointer transition-all ${speciality === "Dermatologist" ? "bg-indigo-100 text-black" : ""}`}>Dermatologist</p>

          <p onClick={() => speciality === 'Pediatricians' ? navigate('/doctors') : navigate('/doctors/Pediatricians')} className={`w-full sm:w-[200px] pl-3 py-2 pr-6 border border-gray-300 rounded-md cursor-pointer transition-all ${speciality === "Pediatricians" ? "bg-indigo-100 text-black" : ""}`}>Pediatricians</p>

          <p onClick={() => speciality === 'Neurologist' ? navigate('/doctors') : navigate('/doctors/Neurologist')} className={`w-full sm:w-[200px] pl-3 py-2 pr-6 border border-gray-300 rounded-md cursor-pointer transition-all ${speciality === "Neurologist" ? "bg-indigo-100 text-black" : ""}`}>Neurologist</p>

          <p onClick={() => speciality === 'Gastroenterologist' ? navigate('/doctors') : navigate('/doctors/Gastroenterologist')} className={`w-full sm:w-[200px] pl-3 py-2 pr-6 border border-gray-300 rounded-md cursor-pointer transition-all ${speciality === "Gastroenterologist" ? "bg-indigo-100 text-black" : ""}`}>Gastroenterologist</p>
        </div>

        {/* Doctors Grid */}
        <div className="w-full grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6">
          {
            filterDoc.map((item, index) => (
              <div
                onClick={() => navigate(`/appointment/${item._id}`)}
                className="h-full flex flex-col border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-2.5 transition-all duration-500 bg-white"
                key={index}
              >
                <img className="bg-blue-50 w-full object-cover" src={item.image} alt={item.name} />
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className={`flex items-center gap-2 text-sm ${item.available ? 'text-green-500' : 'text-gray-500'} mb-1`}>
                    <span className={`w-2 h-2 ${item.available ? 'bg-green-500' : 'bg-gray-500'} rounded-full`}></span>
                    <span>{item.available ? 'Available' : 'Not Available'}</span>
                  </div>
                  <div>
                    <p className="text-gray-900 text-lg font-medium">{item.name}</p>
                    <p className="text-gray-600 text-sm">{item.specialization}</p>
                  </div>
                </div>
              </div>
            ))
          }
        </div>

      </div>
    </div>
  )
}

export default Doctors
