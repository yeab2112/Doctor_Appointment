import React, { useContext, useState } from 'react';
import logo from '../asset/logo.png';
import dropdown_icon from '../asset/dropdown_icon.png';
import { NavLink, useNavigate } from 'react-router-dom';
import menu from '../asset/menu.png';
import cross from '../asset/cross.png';
import { AppContext } from './context';

function Navbar() {
    const usenavigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
const {token,setToken,userData}=useContext(AppContext)
    const handleLogout = () => {
        setToken('');
        localStorage.removeItem('token')
        usenavigate('/login');
    };

    return (
        <div className="w-full">
            <div className="max-w-7xl mx-auto flex items-center justify-between border-b-2 border-gray-300 p-4">
                <img onClick={() => usenavigate('/')} src={logo} alt="Logo" className="h-10 w-auto cursor-pointer" />

                {/* Desktop Menu */}
                <ul className="hidden md:flex space-x-8 mx-auto">
                    <NavLink to="/" className={({ isActive }) => isActive ? "text-gray-600 font-medium underline" : "text-gray-600 hover:text-blue-500 font-medium"}>Home</NavLink>
                    <NavLink to="/doctors" className={({ isActive }) => isActive ? "text-gray-600 font-medium underline" : "text-gray-600 hover:text-blue-500 font-medium"}>All Doctors</NavLink>
                    <NavLink to="/about" className={({ isActive }) => isActive ? "text-gray-600 font-medium underline" : "text-gray-600 hover:text-blue-500 font-medium"}>About</NavLink>
                    <NavLink to="/contact" className={({ isActive }) => isActive ? "text-gray-600 font-medium underline" : "text-gray-600 hover:text-blue-500 font-medium"}>Contact</NavLink>
                </ul>

                {/* User Profile and Dropdown */}
                <div className="relative">
                    {token && userData? (
                        <div className="flex items-center space-x-2">
                            <img src={userData.image} alt="Profile" className="h-10 w-10 rounded-full cursor-pointer" onClick={() => setDropdownOpen(!dropdownOpen)} />
                            <img src={dropdown_icon} alt="Dropdown icon" className="h-6 w-6 cursor-pointer" onClick={() => setDropdownOpen(!dropdownOpen)} />

                            {dropdownOpen && (
                                <div className="absolute top-12 space-y-2 right-0 bg-white shadow-lg p-3 rounded-lg mt-2 border border-gray-300 z-10 min-w-[150px]">
                                    <p onClick={() => usenavigate('/my-profile')} className="font-medium text-gray-800 cursor-pointer hover:text-blue-500">
                                        My Profile
                                    </p>
                                    <p onClick={() => usenavigate('/my-appointment')} className="font-medium text-gray-800 cursor-pointer hover:text-blue-500">
                                        My Appointment
                                    </p>
                                    <p onClick={handleLogout} className="font-medium text-gray-800 cursor-pointer hover:text-blue-500">
                                        Logout
                                    </p>
                                </div>


                            )}
                        </div>
                    ) : (
                        <button onClick={() => usenavigate('/login')} className="bg-blue-500 text-white font-medium px-4 py-2 rounded-full hover:bg-blue-600 transition duration-300">Create Account</button>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <img onClick={() => setShowMenu(true)} src={menu} alt="Menu" className="w-6 md:hidden cursor-pointer" />

                {/* Mobile Menu */}
                {showMenu && (
                    <div className="absolute top-0 left-0 w-full h-full bg-white z-20 flex flex-col p-4">
                        <div className="flex items-center justify-between w-full mb-4">
                            <img src={logo} alt="Logo" className="h-10 cursor-pointer" onClick={() => usenavigate('/')} />
                            <img onClick={() => setShowMenu(false)} src={cross} alt="Close menu" className="w-6 cursor-pointer" />
                        </div>

                        <ul className="flex flex-col space-y-4 mt-6 justify-center items-center">
                            <NavLink
                                to="/"
                                className={({ isActive }) =>
                                    isActive
                                        ? "bg-blue-500 text-white font-medium"
                                        : "text-gray-600 hover:text-blue-500 font-medium transition-all duration-300 ease-in-out focus:outline-none"
                                }
                                onClick={() => setShowMenu(false)}>  Home

                            </NavLink>
                            <NavLink
                                to="/doctors"
                                className={({ isActive }) =>
                                    isActive
                                        ? "bg-blue-500 text-white font-medium"
                                        : "text-gray-600 hover:text-blue-500 font-medium transition-all duration-300 ease-in-out focus:outline-none"
                                }
                                onClick={() => setShowMenu(false)} > Doctors
                            </NavLink>

                            <NavLink
                                to="/about"
                                className={({ isActive }) =>
                                    isActive
                                        ? "bg-blue-500 text-white font-medium"
                                        : "text-gray-600 hover:text-blue-500 font-medium transition-all duration-300 ease-in-out focus:outline-none"
                                }
                                onClick={() => setShowMenu(false)}  > About

                            </NavLink>
                            <NavLink
                                to="/contact"
                                className={({ isActive }) =>
                                    isActive
                                        ? "bg-blue-500 text-white font-medium"
                                        : "text-gray-600 hover:text-blue-500 font-medium transition-all duration-300 ease-in-out focus:outline-none"
                                }
                                onClick={() => setShowMenu(false)} > Contact

                            </NavLink>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Navbar;
