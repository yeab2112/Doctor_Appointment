import React,{useContext} from 'react';
import { AppContext } from '../component/context.js'; 

function Myappointment() {

  const { Topdoctors} = useContext(AppContext); 
  return (
    <div className="container mx-auto p-4">
      <p className="text-2xl font-bold text-center mb-4">My Appointment</p>
      <div className="flex flex-col gap-6">
        {Topdoctors.slice(0, 3).map((item, index) => (
          <div 
            key={index} 
            className="bg-white shadow-lg rounded-lg p-4 flex flex-col sm:flex-row items-start"
          >
            {/* Image Section */}
            <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-4 w-full sm:w-48">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-auto object-cover bg-slate-600 rounded-lg" 
              />
            </div>

            {/* Details Section */}
            <div className="flex-grow mb-4 sm:mb-0">
              <p className="text-lg font-semibold text-gray-800">{item.name}</p>
              <p className="text-gray-500">{item.specialty}</p>
              <p className="text-gray-600 font-medium mt-2">Address</p>
              <p className="text-gray-500">{item.adress.line1}</p>
              <p className="text-gray-500">{item.adress.line2}</p>
              <p className="text-gray-600 font-medium mt-2">
                <span>Date & Time:</span> 25, July 2024 | 8:30 PM
              </p>
            </div>

            {/* Buttons Section */}
            <div className="flex flex-col gap-4">
              <button className="bg-green-500 focus:outline-none text-white px-4 py-2 rounded-lg hover:bg-green-600">
                Pay Online
              </button>
              <button className="bg-red-500 focus:outline-none text-white px-4 py-2 rounded-lg hover:bg-red-600">
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Myappointment;
