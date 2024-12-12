import React, { useContext, useEffect, useState } from 'react';
import { DoctorContext } from '../../context/doctorContext';

function DoctorProfile() {
  const { dToken, loadDoctorProfileData, docData } = useContext(DoctorContext);
const[isEdit,setIsEdit]=useState(false)
  useEffect(() => {
    if (dToken) {
      loadDoctorProfileData();
    }
  }, [dToken]);

  if (!docData) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white shadow-md rounded-lg">
      <div className="flex flex-col items-center">
        <img
          src={docData.image}
          alt={docData.name || 'Doctor'}
          className="w-32 h-32 rounded-full object-cover"
        />
        <p className="mt-4 text-xl font-semibold text-gray-800">{docData.name}</p>
        <p className="text-gray-600">{`${docData.degree} - ${docData.speciality}`}</p>
        <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          {docData.experience} years of experience
        </button>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-800">About</h2>
        <p className="text-gray-600">{docData.about}</p>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold text-gray-800">Appointment Fee</h2>
        <p className="text-gray-600">
          <span className="font-bold">${docData.fees}</span>
        </p>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold text-gray-800">Address</h2>
        <p className="text-gray-600">
          {docData.address.address1}
          <br />
          {docData.address.address2}
        </p>
      </div>

      <div className="mt-4 flex items-center">
        <input
          type="checkbox"
          id="availability"
          name="availability"
          className="mr-2"
          checked={docData.available}
        />
        <label htmlFor="availability" className="text-gray-600">
          Available
        </label>
      </div>

      <button  onClick={()=>setIsEdit(true)} className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
        Edit
      </button>
    </div>
  );
}

export default DoctorProfile;
