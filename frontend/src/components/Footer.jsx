import React from 'react'
import { assets } from '../assets/assets'
import { Link, useNavigate} from 'react-router-dom'

const Footer = () => {
    const navigate = useNavigate();

    const goTo = (path) => {
        navigate(path);
        window.scrollTo(0, 0);
};

    return (
        <div className='md:mx-10'>
            <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
                {/* Left Section */}
                <div>
                    <img className='mb-5 w-40' src={assets.logo} alt="" />
                    <p className='w-full md:w-2/3 text-gray-600 leading-6'>This doctor appointment booking system helps patients find doctors and book
                        appointments easily. It reduces waiting time, saves effort, and makes healthcare
                        services more accessible for everyone.</p>
                </div>

                {/* Center Section */}
                <div>
                    <p className='text-xl font-medium mb-5'>COMPANY</p>
                    <ul className='flex flex-col gap-2 text-gray-600'>
                        <li onClick={() => goTo('/')} className="hover:text-black cursor-pointer">
                            Home
                        </li>
                        <li onClick={() => goTo('/about')} className="hover:text-black cursor-pointer">
                            About Us
                        </li>
                        <li onClick={() => goTo('/contact')} className="hover:text-black cursor-pointer">
                            Contact Us
                        </li>

                    </ul>
                </div>
                {/* Right Section */}
                <div>
                    <p className='text-xl font-medium mb-5'>Get In Touch</p>
                    <ul className='flex flex-col gap-2 text-gray-600'>
                        <li>9800115544</li>
                        <li>doctorappointment@gmail.com</li>
                    </ul>
                </div>
            </div>
            <div>
                {/* Copyright text */}
                <hr />
                <p className='py-5 text-sm text-center'>Copyright 2026@ Prescripto - All Rights Reserved</p>
            </div>
        </div>
    )
}

export default Footer