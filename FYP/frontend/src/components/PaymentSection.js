import React, { useState } from 'react';
import { bookingAPI } from '../api/api';

const PaymentSection = ({ booking, onPaymentComplete }) => {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showOnlinePayment, setShowOnlinePayment] = useState(false);

  // Only show payment section for completed bookings that are not paid
  if (booking.status !== 'COMPLETED' || booking.payment_status === 'PAID') {
    return null;
  }

  const handleOfflinePayment = async () => {
    if (!window.confirm('Confirm offline payment?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await bookingAPI.markOfflinePayment(booking.id);
      alert('Payment completed (Offline)');
      if (onPaymentComplete) {
        onPaymentComplete(response.data.booking);
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const handleOnlinePaymentClick = () => {
    // Open Bank Muamalat payment page in new tab
    window.open('https://www.i-muamalat.com.my/rib/index.do', '_blank');
    setShowOnlinePayment(true);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadReceipt = async () => {
    if (!selectedFile) {
      alert('Please select a receipt file');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('receipt', selectedFile);

      const response = await bookingAPI.uploadPaymentReceipt(booking.id, formData);
      alert('Payment receipt uploaded successfully');
      if (onPaymentComplete) {
        onPaymentComplete(response.data.booking);
      }
      setShowOnlinePayment(false);
      setSelectedFile(null);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to upload receipt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h4 className="font-bold text-yellow-900">Payment Required</h4>
      </div>
      
      <p className="text-sm text-yellow-800 mb-4">
        Service completed! Please select a payment method to complete your booking.
      </p>

      {!showOnlinePayment ? (
        <div className="space-y-3">
          <button
            onClick={handleOfflinePayment}
            disabled={loading}
            className="w-full btn bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Offline Payment'}
          </button>

          <button
            onClick={handleOnlinePaymentClick}
            disabled={loading}
            className="w-full btn bg-blue-600 hover:bg-blue-700 text-white"
          >
            Online Payment
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Note:</strong> Cleaner's bank account details will be provided physically after cleaning.
            </p>
            <p className="text-xs text-blue-700">
              After making the payment, please upload your receipt below.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Payment Receipt
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {selectedFile && (
              <p className="text-xs text-gray-600 mt-1">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>

          <button
            onClick={handleUploadReceipt}
            disabled={loading || !selectedFile}
            className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Uploading...' : 'Payment Done'}
          </button>

          <button
            onClick={() => {
              setShowOnlinePayment(false);
              setSelectedFile(null);
            }}
            className="w-full btn btn-secondary text-sm"
          >
            Back to Payment Options
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentSection;
