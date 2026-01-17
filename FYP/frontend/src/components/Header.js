import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600';
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900">AIU Cleaning Service</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!isAuthenticated ? (
              <>
                <Link to="/" className={`font-medium transition-colors ${isActive('/')}`}>
                  Home
                </Link>
                <Link to="/services" className={`font-medium transition-colors ${isActive('/services')}`}>
                  Services
                </Link>
                <Link to="/about" className={`font-medium transition-colors ${isActive('/about')}`}>
                  About Us
                </Link>
                <Link to="/login" className="btn btn-secondary">
                  Log In
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </>
            ) : (
              <>
                <span className="text-gray-700">Welcome, <span className="font-semibold">{user?.name}</span></span>
                <Link
                  to={`/${user?.role.toLowerCase()}/dashboard`}
                  className="btn btn-secondary"
                >
                  Dashboard
                </Link>
                <button onClick={logout} className="btn btn-primary">
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3 animate-slide-down">
            {!isAuthenticated ? (
              <>
                <Link to="/" className="block py-2 text-gray-700 hover:text-primary-600">
                  Home
                </Link>
                <Link to="/services" className="block py-2 text-gray-700 hover:text-primary-600">
                  Services
                </Link>
                <Link to="/about" className="block py-2 text-gray-700 hover:text-primary-600">
                  About Us
                </Link>
                <Link to="/login" className="block btn btn-secondary w-full text-center">
                  Log In
                </Link>
                <Link to="/register" className="block btn btn-primary w-full text-center">
                  Register
                </Link>
              </>
            ) : (
              <>
                <div className="py-2 text-gray-700">
                  Welcome, <span className="font-semibold">{user?.name}</span>
                </div>
                <Link
                  to={`/${user?.role.toLowerCase()}/dashboard`}
                  className="block btn btn-secondary w-full text-center"
                >
                  Dashboard
                </Link>
                <button onClick={logout} className="block btn btn-primary w-full">
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
