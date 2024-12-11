import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from './context.js'; 
function RelatedDoctors({ docId, specialty }) {
  const [relDoc, setRelDoc] = useState([]);
  const{Topdoctors}=useContext(AppContext)
  const navigate = useNavigate();

  useEffect(() => {
    if (Topdoctors.length > 0 && specialty) {
      const docData = Topdoctors.filter((doc) => doc.specialty === specialty && doc._id !== docId);
      setRelDoc(docData);
    }
  }, [specialty, docId]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Related Doctors</h1>
      <p className="text-center text-gray-600 mb-8">
        Simply browse through our extensive list of trusted doctors...
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {relDoc.slice(0, 2).map((doctor) => (
          <div 
            key={doctor._id}
            onClick={() => {
              navigate(`/appointment/${doctor._id}`);
              window.scrollTo(0, 0);
            }}
            className="bg-white shadow-lg rounded-lg p-4 cursor-pointer transform hover:-translate-y-2 transition-all duration-500"
          >
            <img src={doctor.image} alt={doctor.name} className="w-full h-48 object-cover rounded-t-lg" />
            <div className="p-2">
              <p className="text-lg font-semibold text-gray-800">{doctor.name}</p>
              <p className="text-gray-500">{doctor.specialty}</p>
              <p className="text-green-600 font-medium mt-2">Availability</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <button 
          onClick={() => {
            navigate('/doctors');
            window.scrollTo(0, 0);
          }}
          className="mt-6 bg-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-700 w-24"
        >
          More
        </button>
      </div>
    </div>
  );
}

export default RelatedDoctors;
