import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast';

const Register = () => {
  const navigate = useNavigate();
  const { registerStudent, registerCleaner } = useAuth();
  const [registerAs, setRegisterAs] = useState('STUDENT');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const [studentData, setStudentData] = useState({
    name: '',
    email: '',
    password: '',
    confirm_password: '',
    student_id: '',
    block: '',
    room_number: '',
    phone: '',
  });

  const [cleanerData, setCleanerData] = useState({
    name: '',
    email: '',
    password: '',
    confirm_password: '',
    staff_id: '',
    phone: '',
    assigned_blocks: '',
  });

  const handleStudentChange = (e) => {
    setStudentData({ ...studentData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleCleanerChange = (e) => {
    setCleanerData({ ...cleanerData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateStudentForm = () => {
    const newErrors = {};

    if (studentData.password !== studentData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    if (!/^AIU\d{8}$/.test(studentData.student_id)) {
      newErrors.student_id = 'Student ID must be in format: AIU followed by 8 digits (e.g., AIU23102325)';
    }

    if (!/^\d{2}[A-Z]$/.test(studentData.block)) {
      newErrors.block = 'Block must be in format: 2 digits followed by 1 uppercase letter (e.g., 25E)';
    }

    if (!/^\d{2}[A-Z]-\d{2}-\d{2}$/.test(studentData.room_number)) {
      newErrors.room_number = 'Room number must be in format: 25E-04-10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCleanerForm = () => {
    const newErrors = {};

    if (cleanerData.password !== cleanerData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (registerAs === 'STUDENT') {
      if (!validateStudentForm()) {
        setLoading(false);
        return;
      }

      const result = await registerStudent(studentData);

      if (result.success) {
        setToast({ message: 'Registration successful!', type: 'success' });
        setTimeout(() => {
          navigate('/student/dashboard');
        }, 1000);
      } else {
        console.log('Registration errors:', result.error);
        // Set field-specific errors if available
        if (typeof result.error === 'object') {
          setErrors(result.error);
          // Get first error message for toast
          const firstError = Object.values(result.error)[0];
          const errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
          setToast({ message: errorMsg || 'Registration failed. Please check the form.', type: 'error' });
        } else {
          setToast({ message: result.error || 'Registration failed. Please check the form.', type: 'error' });
        }
        setLoading(false);
      }
    } else {
      if (!validateCleanerForm()) {
        setLoading(false);
        return;
      }

      const result = await registerCleaner(cleanerData);

      if (result.success) {
        setToast({ message: 'Registration successful!', type: 'success' });
        setTimeout(() => {
          navigate('/cleaner/dashboard');
        }, 1000);
      } else {
        console.log('Cleaner registration errors:', result.error);
        // Set field-specific errors if available
        if (typeof result.error === 'object') {
          setErrors(result.error);
          // Get first error message for toast
          const firstError = Object.values(result.error)[0];
          const errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
          setToast({ message: errorMsg || 'Registration failed. Please check the form.', type: 'error' });
        } else {
          setToast({ message: result.error || 'Registration failed. Please check the form.', type: 'error' });
        }
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="AIU Logo" className="h-16 w-auto mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-600 mt-2">Join AIU Hostel Cleaning Service</p>
        </div>

        <div className="card animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Register As */}
            <div>
              <label className="label">Register As</label>
              <div className="grid grid-cols-2 gap-2">
                {['STUDENT', 'CLEANER'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setRegisterAs(role)}
                    className={`py-2 px-4 rounded-lg font-medium transition-all ${registerAs === role
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {role.charAt(0) + role.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {registerAs === 'STUDENT' ? (
              <>
                {/* Student Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={studentData.name}
                      onChange={handleStudentChange}
                      className="input-field"
                      required
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{Array.isArray(errors.name) ? errors.name[0] : errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={studentData.email}
                      onChange={handleStudentChange}
                      className="input-field"
                      required
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{Array.isArray(errors.email) ? errors.email[0] : errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={studentData.password}
                      onChange={handleStudentChange}
                      className="input-field"
                      required
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{Array.isArray(errors.password) ? errors.password[0] : errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Confirm Password</label>
                    <input
                      type="password"
                      name="confirm_password"
                      value={studentData.confirm_password}
                      onChange={handleStudentChange}
                      className="input-field"
                      required
                    />
                    {errors.confirm_password && (
                      <p className="text-red-500 text-sm mt-1">{errors.confirm_password}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Student ID</label>
                    <input
                      type="text"
                      name="student_id"
                      value={studentData.student_id}
                      onChange={handleStudentChange}
                      className="input-field"
                      placeholder="AIU23102325"
                      required
                    />
                    {errors.student_id && (
                      <p className="text-red-500 text-sm mt-1">{errors.student_id}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Block</label>
                    <input
                      type="text"
                      name="block"
                      value={studentData.block}
                      onChange={handleStudentChange}
                      className="input-field"
                      placeholder="25E"
                      required
                    />
                    {errors.block && (
                      <p className="text-red-500 text-sm mt-1">{errors.block}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Room Number</label>
                    <input
                      type="text"
                      name="room_number"
                      value={studentData.room_number}
                      onChange={handleStudentChange}
                      className="input-field"
                      placeholder="25E-04-10"
                      required
                    />
                    {errors.room_number && (
                      <p className="text-red-500 text-sm mt-1">{errors.room_number}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Phone (Optional)</label>
                    <input
                      type="tel"
                      name="phone"
                      value={studentData.phone}
                      onChange={handleStudentChange}
                      className="input-field"
                      placeholder="+60123456789"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{Array.isArray(errors.phone) ? errors.phone[0] : errors.phone}</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Cleaner Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={cleanerData.name}
                      onChange={handleCleanerChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={cleanerData.email}
                      onChange={handleCleanerChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={cleanerData.password}
                      onChange={handleCleanerChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Confirm Password</label>
                    <input
                      type="password"
                      name="confirm_password"
                      value={cleanerData.confirm_password}
                      onChange={handleCleanerChange}
                      className="input-field"
                      required
                    />
                    {errors.confirm_password && (
                      <p className="text-red-500 text-sm mt-1">{errors.confirm_password}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Staff ID</label>
                    <input
                      type="text"
                      name="staff_id"
                      value={cleanerData.staff_id}
                      onChange={handleCleanerChange}
                      className="input-field"
                      placeholder="CLN001"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={cleanerData.phone}
                      onChange={handleCleanerChange}
                      className="input-field"
                      placeholder="+60123456789"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="label">Assigned Blocks (Optional)</label>
                    <input
                      type="text"
                      name="assigned_blocks"
                      value={cleanerData.assigned_blocks}
                      onChange={handleCleanerChange}
                      className="input-field"
                      placeholder="25E,26F,27G"
                    />
                    <p className="text-gray-500 text-xs mt-1">Comma-separated block codes</p>
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-medium hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
