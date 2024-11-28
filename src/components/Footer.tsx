import React from 'react';

export function Footer() {
  return (
    <>
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          By connecting, you agree to our{' '}
          <a href="#" className="text-red-500 hover:text-red-600">
            Terms of Service
          </a>
          {' '}and{' '}
          <a href="#" className="text-red-500 hover:text-red-600">
            Privacy Policy
          </a>
        </p>
      </div>
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          Need help?{' '}
          <a href="#" className="text-red-500 hover:text-red-600">
            Contact Support
          </a>
        </p>
      </div>
    </>
  );
}