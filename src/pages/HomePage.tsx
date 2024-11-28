import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CircleUserRound, Calendar, Clock, Layout, Brain, Target, Zap } from 'lucide-react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

function HomePage() {
  const navigate = useNavigate();
  const { user } = useFirebaseAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSignUp = () => {
    navigate('/auth', { state: { signup: true } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <CircleUserRound className="h-8 w-8 text-red-500" />
              <span className="ml-2 text-xl font-semibold">PinMaster</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/auth"
                className="text-gray-700 hover:text-red-600 font-medium"
              >
                Sign in
              </Link>
              <button
                onClick={handleSignUp}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Transform Your Pinterest Marketing</span>
              <span className="block text-red-600">with AI-Powered Automation</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Elevate your Pinterest presence with intelligent scheduling and data-driven content management. Our platform helps you reach your ideal audience at the perfect time, every time.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <button
                  onClick={handleSignUp}
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 md:py-4 md:text-lg md:px-10"
                >
                  Sign up
                </button>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <Link
                  to="/auth"
                  className="w-full flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-red-500 rounded-md shadow-lg">
                        <Brain className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">AI-Powered Scheduling</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Our smart algorithm analyzes your audience's behavior to determine the perfect posting times for maximum engagement.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-red-500 rounded-md shadow-lg">
                        <Target className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Strategic Content Planning</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Plan and schedule your content strategically with our intuitive bulk upload and management tools.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-red-500 rounded-md shadow-lg">
                        <Zap className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Automated Publishing</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Set it and forget it with our reliable automated publishing system. Never miss a prime posting opportunity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Terms
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Privacy
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Contact
            </a>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-400">
              &copy; 2024 PinMaster. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;