import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../component/context.js';
import verifed from '../asset/verifed.png';
import RelatedDoctors from '../component/relateddoctors';
import { toast } from 'react-toastify';

function Appointment() {
  const { _Id } = useParams(); 
  const [docInfo, setDocInfo] = useState(null);
  const [docSlot, setDocSlot] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState(null);
  const navigate = useNavigate();
  const { doctors, getDoctors, token } = useContext(AppContext);
  const dayOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // Fetch doctor information
  const fetchDocInfo = useCallback(() => {
    const doc = doctors.find((doc) => doc._id === _Id);
    setDocInfo(doc || null);
  }, [_Id, doctors]);

  // Generate time slots for the week
  const getAvailableSlot = useCallback(() => {
    const slots = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      let endTime = new Date(currentDate);
      endTime.setHours(21, 0, 0, 0);

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10);
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10, 0, 0, 0);
      }

      const timeSlot = [];
      while (currentDate < endTime) {
        const formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Assume that the logic to check if a slot is available is here
        // For example, a real check could be if the slot is booked in a database
        const isSlotBooked = false; // Replace this with actual logic

        // Only add time slots that are not booked
        if (!isSlotBooked) {
          timeSlot.push({
            datetime: new Date(currentDate),
            time: formattedTime,
          });
        }
        
        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }
      slots.push(timeSlot);
    }

    setDocSlot(slots);
  }, []);

  useEffect(() => {
    if (!doctors || doctors.length === 0) {
      getDoctors();
    } else {
      fetchDocInfo();
    }
  }, [doctors, fetchDocInfo, getDoctors]);

  useEffect(() => {
    if (docInfo) getAvailableSlot();
  }, [docInfo, getAvailableSlot]);

  // Handle booking process
  const handleBooking = async () => {
    if (!token) {
      toast.warn('Login to book an appointment');
      navigate('/login');
      return;
    }
  
    if (slotTime) {
      const date = docSlot[slotIndex][0].datetime; // The date of the selected slot
      const day = date.getDate();
      const month = date.getMonth() + 1; // Months are 0-based
      const year = date.getFullYear();
      const slotDate = `${day}_${month}_${year}`; // Format the slotDate
  
      // Assuming `userDate` is the current date
      const userDate = new Date(); // Current date as user's appointment date
      
      try {
        const { data } = await axios.post(
          'http://localhost:5001/api/user/book-appointment',
          {
            userDate,        // Send current date as userDate
            docDate: date,   // Send selected date as docDate
            date,            // Send the full date for the appointment
            slotTime,        // Selected time slot
            docId: _Id,      // Doctor ID
            slotDate,        // Formatted slotDate (day_month_year)
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        if (data.success) {
          toast.success(`Booking confirmed for ${docInfo.name} at ${slotTime}`);
        } else {
          toast.error(data.message || 'Failed to book appointment');
        }
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || 'Failed to book appointment');
      }
    } else {
      toast.warn('Please select a time slot to proceed with booking.');
    }
  };
  
  

  return docInfo ? (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* Profile Section */}
      <div className="flex flex-col md:flex-row max-w-3xl w-full bg-gray-100 rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-center bg-blue-400 p-6 md:w-1/3">
          <img
            src={docInfo.image}
            alt={docInfo.name}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full shadow-md"
          />
        </div>
        <div className="p-6 md:w-2/3">
          <div className="flex items-center justify-center md:justify-start">
            <h2 className="text-2xl font-semibold">{docInfo.name}</h2>
            <img src={verifed} alt="Verified badge" className="w-5 h-5 ml-2" />
          </div>
          <p className="text-center md:text-left text-gray-600 mt-2">
            {docInfo.degree} - {docInfo.speciality}
          </p>
          <div className="flex justify-center md:justify-start mt-4">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              {docInfo.experience} Years Experience
            </button>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">About</h3>
            <p className="text-gray-700">{docInfo.about}</p>
          </div>
          <p className="text-gray-500 font-medium mt-4">
            Appointment Fee: $<span className="text-gray-800">{docInfo.fees}</span>
          </p>
        </div>
      </div>

      {/* Schedule Section */}
      <div className="mt-6 w-full max-w-3xl bg-white rounded-lg shadow-lg p-4">
        <p className="text-lg font-semibold text-center">Booking Slots</p>
        <div className="flex justify-center overflow-x-scroll mt-4 space-x-2">
          {docSlot?.map((daySlots, index) => {
            const day = daySlots[0]?.datetime ? daySlots[0].datetime.getDay() : null;
            return (
              <button
                key={index}
                onClick={() => setSlotIndex(index)}
                className={`p-2 rounded-md border ${
                  index === slotIndex ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
                disabled={daySlots.length === 0}
              >
                {day !== null ? (
                  <>
                    {dayOfWeek[day]} <br />
                    {daySlots[0]?.datetime?.getDate()}
                  </>
                ) : (
                  'No Slots'
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex overflow-x-scroll space-x-2">
          {docSlot[slotIndex]?.map((slot, index) => (
            <button
              key={index}
              onClick={() => setSlotTime(slot.time)}
              className={`p-2 rounded-md border ${
                slotTime === slot.time ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}
              disabled={false}  // Disable logic here to mark booked slots
            >
              {slot.time}
            </button>
          ))}
        </div>
        <div className="flex justify-center mt-6">
          <button
            onClick={handleBooking}
            className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors focus:outline-none"
          >
            Book an appointment
          </button>
        </div>
      </div>

      <RelatedDoctors doctorId={docInfo._id} specialty={docInfo.speciality} />
    </div>
  ) : (
    <p className="text-center mt-10">No doctor found with this ID.</p>
  );
}

export default Appointment;
