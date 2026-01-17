import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Services = () => {
  const { isAuthenticated } = useAuth();

  const services = [
    {
      id: 1,
      name: 'Standard Cleaning',
      price: 20,
      subtitle: 'Without washroom',
      paragraphs: [
        'Essential room cleaning service designed for regular upkeep and daily maintenance.',
        'Floor sweeping and mopping to keep surfaces clean.',
        'Dusting of furniture, shelves, and accessible surfaces.',
        'Trash removal and bin cleaning.',
        'Bed making and general tidying.',
        'Window sill and door frame wiping.',
        'Note: Bathroom cleaning is NOT included in this package.',
      ],
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      id: 2,
      name: 'Deep Cleaning',
      price: 30,
      subtitle: 'With washroom',
      paragraphs: [
        'Comprehensive cleaning service with complete room and bathroom sanitization.',
        'Everything included in Standard Cleaning, plus:',
        'Complete bathroom cleaning and sanitization (toilet, sink, shower).',
        'Deep cleaning of corners and hard-to-reach areas.',
        'Window and mirror cleaning.',
        'Thorough floor scrubbing and disinfection.',
        'Cabinet and drawer exterior cleaning.',
      ],
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Cleaning Services</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Choose the perfect cleaning service for your needs
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <div
                key={service.id}
                className="card hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-center text-primary-600 mb-4">
                  {service.icon}
                </div>

                <h2 className="text-2xl font-bold text-center mb-1">{service.name}</h2>
                <p className="text-center text-gray-600 font-medium mb-3">{service.subtitle}</p>

                <div className="text-center mb-4">
                  <span className="text-4xl font-bold text-primary-600">RM {service.price}</span>
                  <span className="text-gray-600 ml-2">/ service</span>
                </div>

                <ul className="space-y-3 mb-6 text-gray-700">
                  {service.paragraphs.map((paragraph, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="leading-relaxed">{paragraph}</span>
                    </li>
                  ))}
                </ul>

                {isAuthenticated && (
                  <Link
                    to="/student/book"
                    className="btn btn-primary w-full"
                  >
                    Book This Service
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">What to Expect</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-xl font-bold mb-3 flex items-center">
                  <svg className="w-6 h-6 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Flexible Timing
                </h3>
                <p className="text-gray-600">
                  Book services from 8:00 AM to 11:00 PM with 30-minute time slots to fit your schedule
                </p>
              </div>

              <div className="card">
                <h3 className="text-xl font-bold mb-3 flex items-center">
                  <svg className="w-6 h-6 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Trained Staff
                </h3>
                <p className="text-gray-600">
                  All our cleaners are professionally trained and background-checked for your safety
                </p>
              </div>

              <div className="card">
                <h3 className="text-xl font-bold mb-3 flex items-center">
                  <svg className="w-6 h-6 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Quality Guarantee
                </h3>
                <p className="text-gray-600">
                  We ensure high-quality cleaning standards. Report any issues and we'll make it right
                </p>
              </div>

              <div className="card">
                <h3 className="text-xl font-bold mb-3 flex items-center">
                  <svg className="w-6 h-6 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Real-time Updates
                </h3>
                <p className="text-gray-600">
                  Get notifications when your booking is confirmed, assigned, and completed
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-16 bg-primary-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Book?</h2>
            <p className="text-xl mb-8 text-primary-100">
              Create an account to start booking our cleaning services
            </p>
            <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg">
              Get Started
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Services;
