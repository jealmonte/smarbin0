import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { signIn, signUp, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp({ 
          email, 
          password,
          firstName,
          lastName
        });
        if (error) throw error;
      } else {
        const { error } = await signIn({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-emerald-900/30 p-8 rounded-lg"
      >
        <h2 className="text-2xl font-bold text-center mb-8">
          {isSignUp ? 'Create an Account' : 'Welcome Back'}
        </h2>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <>
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-emerald-200 mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-black/20 border border-emerald-600/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-emerald-200 mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-black/20 border border-emerald-600/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-emerald-200 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/20 border border-emerald-600/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-emerald-200 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/20 border border-emerald-600/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}