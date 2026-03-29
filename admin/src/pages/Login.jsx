import React, { useContext, useState } from 'react'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Login = () => {
    const [role, setRole] = useState('Admin') // Admin or Doctor
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const { setAToken, backendUrl: adminBackendUrl } = useContext(AdminContext)
    const { setDToken, backendUrl: doctorBackendUrl } = useContext(DoctorContext)

    const clearOtherTokens = () => {
        // Clear the opposite role token when switching or logging in
        if (role === 'Admin') {
            localStorage.removeItem('dToken')
            setDToken('')
        } else {
            localStorage.removeItem('aToken')
            setAToken('')
        }
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault()
        clearOtherTokens() // clear previous role token

        try {
            if (role === 'Admin') {
                const { data } = await axios.post(adminBackendUrl + '/admin/login', { email, password })
                if (data.success) {
                    localStorage.setItem('aToken', data.token)
                    setAToken(data.token)
                    toast.success('Admin logged in successfully!')
                } else {
                    toast.error(data.message)
                }
            } else {
                const { data } = await axios.post(doctorBackendUrl + '/doctor/login', { email, password })
                if (data.success) {
                    localStorage.setItem('dToken', data.token)
                    setDToken(data.token)
                    toast.success('Doctor logged in successfully!')
                } else {
                    toast.error(data.message)
                }
            }
        } catch (error) {
            toast.error('Login failed. Please try again.')
        }
    }

    const switchRole = (newRole) => {
        clearOtherTokens()
        setRole(newRole)
        setEmail('')
        setPassword('')
    }

    return (
        <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
            <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-85 sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
                <p className='text-2xl font-semibold m-auto'>
                    <span className='text-primary'>{role}</span> Login
                </p>

                <div className='w-full'>
                    <p>Email</p>
                    <input
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        className='border border-[#DADADA] rounded w-full p-2 mt-1'
                        type="email"
                        required
                    />
                </div>

                <div className='w-full'>
                    <p>Password</p>
                    <input
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        className='border border-[#DADADA] rounded w-full p-2 mt-1'
                        type="password"
                        required
                    />
                </div>

                <button className='bg-primary text-white w-full py-2 rounded-md text-base'>Login</button>

                <div className='mt-2 text-center text-sm'>
                    {role === 'Admin' ? (
                        <p>
                            Doctor Login{' '}
                            <span
                                className='text-primary underline cursor-pointer'
                                onClick={() => switchRole('Doctor')}
                            >
                                Click here
                            </span>
                        </p>
                    ) : (
                        <p>
                            Admin Login{' '}
                            <span
                                className='text-primary underline cursor-pointer'
                                onClick={() => switchRole('Admin')}
                            >
                                Click here
                            </span>
                        </p>
                    )}
                </div>
            </div>
        </form>
    )
}

export default Login