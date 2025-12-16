import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { doCreateUserWithEmailAndPassword, doSignInWithGoogle } from './auth';
import { useAuth } from '../../authContext';
import { FcGoogle } from 'react-icons/fc';
import Logo from '../../assets/logo.png';

const Register = () => {
  const { userLoggedIn } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    try {
      setIsRegistering(true);
      setErrorMessage('');
      await doCreateUserWithEmailAndPassword(email, password);
    } catch (error) {
      setErrorMessage(error.message);
      setIsRegistering(false);
    }
  };

  const onGoogleSignIn = async (e) => {
    e.preventDefault();
    try {
      setIsRegistering(true);
      setErrorMessage('');
      await doSignInWithGoogle();
    } catch (error) {
      setErrorMessage(error.message);
      setIsRegistering(false);
    }
  };

  if (userLoggedIn) return <Navigate to="/home" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 sm:px-6">

      {/* Centered container */}
      <div className="relative w-full max-w-md sm:max-w-lg">

        {/* Grid background */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ececec 1px, transparent 1px), linear-gradient(to bottom, #ececec 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            WebkitMaskImage:
              'linear-gradient(to right, transparent, black 60%, black 40%, transparent)',
            maskImage:
              'linear-gradient(to right, transparent, black 40%, black 60%, transparent)',
          }}
        />

        {/* Content */}
        <div className="relative px-6 sm:px-10 py-10 sm:py-12 text-center">

          {/* Logo placeholder */}
          <div className="mb-8 flex justify-center">
           <img
             src={Logo}
             alt="App Logo"
             className="h-10 sm:h-12 w-auto object-contain"
           />                   
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Create an account
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-500">
            Choose a username and secure your account.
          </p>

          {/* Google signup */}
          <button
            onClick={onGoogleSignIn}
            disabled={isRegistering}
            className="mt-6 w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-3 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            <FcGoogle className="text-lg" />
            Sign up with Google
          </button>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-grow border-t border-gray-300" />
            <span className="mx-4 text-sm text-gray-500">OR</span>
            <div className="flex-grow border-t border-gray-300" />
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="text-left space-y-5">

            {/* Username */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Choose a username"
                disabled={isRegistering}
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                autoComplete="off"
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Enter your email"
                disabled={isRegistering}
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Create a password"
                disabled={isRegistering}
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 6 characters.
              </p>
            </div>

            {/* Confirm password */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Confirm your password"
                disabled={isRegistering}
              />
            </div>

            {errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isRegistering}
              className="w-full rounded-lg bg-purple-600 py-3 text-white font-medium hover:bg-purple-700 transition disabled:opacity-50"
            >
              {isRegistering ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-600 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
