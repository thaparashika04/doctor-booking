import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Navbar = () => {
  const navigate = useNavigate();

  const {token, setToken,userData} = useContext(AppContext)
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const logout = () => {
    setToken(false)
    localStorage.removeItem('token')
  }

  return (
    <div className="flex items-center justify-between text-sm py-4 md:px-5 border-b border-gray-400">

      {/* Logo */}
      <img
        onClick={() => navigate('/')}
        className="w-44 cursor-pointer"
        src={assets.logo}
        alt="logo"
      />

      {/* Desktop Menu */}
      <ul className="hidden md:flex items-start gap-5 font-medium">
        {[
          { name: 'HOME', path: '/' },
          { name: 'ALL DOCTORS', path: '/doctors' },
          { name: 'ABOUT', path: '/about' },
          { name: 'CONTACT', path: '/contact' }
        ].map((link, index) => (
          <NavLink
            key={index}
            to={link.path}
            className={({ isActive }) =>
              `group relative ${isActive ? 'text-primary' : 'text-gray-700'}`
            }
          >
            <li>{link.name}</li>
            <span className={`absolute left-0 right-0 -bottom-1 h-0.5 bg-primary transition-all duration-300 ${window.location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'}`} />
          </NavLink>
        ))}
      </ul>

      {/* Profile + Mobile Menu */}
      <div className="flex items-center gap-4 relative">
        {token && userData ? (
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <img className="w-8 rounded-full" src={userData.image} alt="" />
            <img className="w-2.5" src={assets.dropdown_icon} alt="" />

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 top-12 min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4 text-base text-gray-600 z-20">
                <p onClick={() => { navigate('/my-profile'); setShowProfileMenu(false); }} className="hover:text-black cursor-pointer">
                  My Profile
                </p>
                <p onClick={() => { navigate('/my-appointments'); setShowProfileMenu(false); }} className="hover:text-black cursor-pointer">
                  My Appointment
                </p>
                <p onClick={logout} className="hover:text-black cursor-pointer">
                  Logout
                </p>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="bg-primary text-white px-4 py-2 rounded-full font-light hidden md:block"
          >
            Create account
          </button>
        )}

        {/* Mobile Menu Icon */}
        <img
          onClick={() => setShowMobileMenu(true)}
          className='w-6 md:hidden'
          src={assets.menu_icon}
          alt=""
        />

        {/* Mobile Menu */}
        <div className={`${showMobileMenu ? 'fixed inset-0 w-full h-full z-50' : 'h-0 w-0'} md:hidden bg-white overflow-hidden transition-all`}>
          <div className='flex items-center justify-between px-5 py-6'>
            <img className='w-36' src={assets.logo} alt="" />
            <img className='w-7 cursor-pointer' onClick={() => setShowMobileMenu(false)} src={assets.cross_icon} alt="" />
          </div>

          <ul className='flex flex-col items-center gap-2 px-5 text-lg font-medium'>
            {[
              { name: 'Home', path: '/' },
              { name: 'All Doctors', path: '/doctors' },
              { name: 'ABOUT', path: '/about' },
              { name: 'CONTACT', path: '/contact' }
            ].map((link, index) => (
              <NavLink
                key={index}
                to={link.path}
                onClick={() => setShowMobileMenu(false)}
                className={({ isActive }) =>
                  `px-4 py-2 rounded inline-block transition-colors ${isActive ? 'text-primary bg-gray-100' : 'text-gray-700 hover:bg-gray-100'}`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
