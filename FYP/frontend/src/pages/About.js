import React from 'react';

const About = () => {
  return (
    <div className="animate-fade-in">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Learn more about AIU Hostel Cleaning Service System
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-lg text-gray-600">
                To provide a clean, comfortable, and hygienic living environment for all students at Albukhary International University hostel facilities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Clean Environment</h3>
                <p className="text-gray-600">
                  Maintaining high standards of cleanliness for student well-being
                </p>
              </div>

              <div className="card text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Student-Centered</h3>
                <p className="text-gray-600">
                  Services designed with student needs and schedules in mind
                </p>
              </div>

              <div className="card text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Quality Assurance</h3>
                <p className="text-gray-600">
                  Consistent quality through trained professionals and monitoring
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About System Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">About the System</h2>

            <div className="card mb-8">
              <h3 className="text-2xl font-bold mb-4">AIU Hostel Cleaning Service Management System</h3>
              <p className="text-gray-600 mb-4">
                The AIU Hostel Cleaning Service System is a comprehensive digital platform designed to streamline
                the management of cleaning services across all hostel blocks at Albukhary International University.
              </p>
              <p className="text-gray-600">
                This system connects students, cleaning staff, and administrators in a seamless workflow, ensuring
                efficient service delivery, transparent communication, and real-time tracking of all cleaning operations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-xl font-bold mb-3 text-primary-600">For Students</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Easy online booking system
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Flexible scheduling options
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Real-time booking status updates
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Booking history and tracking
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Instant notifications
                  </li>
                </ul>
              </div>

              <div className="card">
                <h3 className="text-xl font-bold mb-3 text-primary-600">For Cleaners</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Daily task dashboard
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Task scheduling and management
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Issue reporting system
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Performance tracking
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Work history and statistics
                  </li>
                </ul>
              </div>

              <div className="card">
                <h3 className="text-xl font-bold mb-3 text-primary-600">For Administrators</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Centralized booking management
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Staff allocation and scheduling
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Maintenance issue tracking
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Comprehensive reporting
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    System-wide analytics
                  </li>
                </ul>
              </div>

              <div className="card">
                <h3 className="text-xl font-bold mb-3 text-primary-600">Key Features</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Role-based access control
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Automated notifications
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Real-time status tracking
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Mobile-responsive design
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Secure authentication
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Our Cleaning Team</h2>
            <p className="text-gray-600 mb-8">
              Our dedicated cleaning staff consists of trained professionals committed to maintaining the highest
              standards of cleanliness and hygiene across all hostel facilities.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card">
                <div className="text-4xl font-bold text-primary-600 mb-2">50+</div>
                <p className="text-gray-600">Cleaning Staff Members</p>
              </div>

              <div className="card">
                <div className="text-4xl font-bold text-primary-600 mb-2">10+</div>
                <p className="text-gray-600">Hostel Blocks Covered</p>
              </div>

              <div className="card">
                <div className="text-4xl font-bold text-primary-600 mb-2">24/7</div>
                <p className="text-gray-600">Support Available</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Info Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Project Information</h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-6">
            This system was developed as a final year project for Albukhary International University,
            aiming to modernize and digitalize the hostel cleaning service management process.
          </p>
          <div className="text-primary-400">
            <p className="font-semibold">Albukhary International University</p>
            <p className="text-sm text-gray-400 mt-1">Final Year Project 2025</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
