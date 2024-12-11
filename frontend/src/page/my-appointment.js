import React, { useContext, useState, useEffect, useCallback } from 'react';
import { AppContext } from '../component/context.js';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

function MyAppointment() {
  const { token, getDoctors } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState('Verifying payment...');
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const txRef = queryParams.get('tx_ref'); // Assuming the tx_ref is passed as a query param
  console.log(txRef);

  const getMyAppointment = useCallback(async () => {
    if (!token) {
      console.warn('Token is missing. Cannot fetch appointments.');
      setAppointments([]);
      return;
    }

    try {
      const { data } = await axios.get(
        'http://localhost:5001/api/user/get-appointment',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Fetched appointments:', data.appointments);

      if (data.success && Array.isArray(data.appointments)) {
        setAppointments(data.appointments);
      } else {
        toast.error(data.message || 'Failed to fetch appointments');
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error(error.response?.data?.message || 'An error occurred while fetching appointments');
      setAppointments([]);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      getMyAppointment();
    }
  }, [token, getMyAppointment]);

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        'http://localhost:5001/api/user/cancel-appointment',
        { appointmentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        getMyAppointment();
        getDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error(error.response?.data?.message);
    }
  };

  const appointmentChapaPay = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        'http://localhost:5001/api/user/payment-appointment',
        { appointmentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success('Redirecting to payment gateway...');
        window.location.href = data.checkoutUrl; // Redirect to Chapa checkout page
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error(error.response?.data?.message);
    }
  };

  // UseEffect to verify the payment once txRef is available
  useEffect(() => {
    const verifyPayment = async () => {
      if (!txRef) return; // Exit early if txRef doesn't exist

      try {
        const response = await axios.post('http://localhost:5000/api/verify', { txRef }, { headers: { Authorization: `Bearer ${token}` } });

        // Update UI based on verification result
        if (response.data.status === 'success') {
          setStatus('Payment successful!');
        } else {
          setStatus('Payment verification failed.');
        }
      } catch (error) {
        setStatus('Error verifying payment.');
        console.error(error);
      }
    };

    verifyPayment();
  }, [txRef, token]); // Trigger payment verification if txRef exists

  return (
    <div className="container mx-auto p-4">
      <p className="text-2xl font-bold text-center mb-4">My Appointments</p>

      {/* Display the payment verification status */}
      {status && <p className="text-center text-xl text-gray-600">{status}</p>}

      <div className="flex flex-col gap-6">
        {appointments.length === 0 ? (
          <p>No appointments found.</p>
        ) : (
          appointments.map((item, index) => (
            <div key={index} className="bg-white shadow-lg rounded-lg p-4 flex flex-col sm:flex-row items-start">
              {/* Image Section */}
              <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-4 w-full sm:w-48">
                <img
                  src={item.docId.image || '/path/to/default-image.jpg'}
                  alt={item.name || 'Appointment Image'}
                  className="w-full h-auto object-cover bg-slate-600 rounded-lg"
                />
              </div>

              <div className="flex-grow mb-4 sm:mb-0">
                <p className="text-lg font-semibold text-gray-800">{item.docId?.name || 'No Name'}</p>
                <p className="text-gray-500">{item.docId?.speciality || 'No Specialty'}</p>
                <p className="text-gray-600 font-medium mt-2">Address</p>
                <p className="text-gray-500">
                  {item.docId?.address?.address1 || ''} {item.docId?.address?.address2 || ''}
                </p>

                <p className="text-gray-600 font-medium mt-2">
                  <span>Date & Time:</span> {new Date(item.date).toLocaleString()}
                </p>
                <p className="text-gray-600 font-medium mt-2">
                  <span>Slot Time:</span> {item.slotTime}
                </p>
              </div>

              {/* Buttons Section */}
              <div className="flex flex-col gap-4">
                {!item.cancelled && item.payment && (
                  <button disabled className="bg-green-500 text-white px-4 py-2 rounded-lg">
                    Paid
                  </button>
                )}
                {!item.cancelled && !item.payment && (
                  <button
                    onClick={() => appointmentChapaPay(item._id)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 focus:outline-none"
                  >
                    Pay Online
                  </button>
                )}
                {!item.cancelled && (
                  <button
                    onClick={() => cancelAppointment(item._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 focus:outline-none"
                  >
                    Cancel
                  </button>
                )}
                {item.cancelled && (
                  <button disabled className="border border-red-500 text-red-500 px-4 py-2 rounded-lg focus:outline-none">
                    Appointment Canceled
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MyAppointment;
