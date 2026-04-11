import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { doSignInWithEmailAndPassword, doSignInWithGoogle } from './auth';
import { useAuth } from '../../authContext';
import { FcGoogle } from 'react-icons/fc';
import Logo from '../../assets/logo.png';

const Login = () => {
  const { userLoggedIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Ensure user exists in MongoDB (for Google sign-in)
  const ensureUserInMongoDB = async (firebaseUser) => {
    try {
      const response = await fetch('http://localhost:8090/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: firebaseUser.uid,
          username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          email: firebaseUser.email,
          favBooks: []
        })
      });
      
      if (response.ok) {
        console.log('User ensured in MongoDB');
      }
    } catch (error) {
      console.error('Error ensuring user in MongoDB:', error);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    try {
      setIsSigningIn(true);
      setErrorMessage('');
      await doSignInWithEmailAndPassword(email, password);
      // User already exists in MongoDB from registration, no need to create again
    } catch (error) {
      setErrorMessage(error.message);
      setIsSigningIn(false);
    }
  };

  const onGoogleSignIn = async (e) => {
    e.preventDefault();
    try {
      setIsSigningIn(true);
      setErrorMessage('');
      
      const userCredential = await doSignInWithGoogle();
      
      // Ensure user exists in MongoDB (creates if first time, returns existing if already exists)
      await ensureUserInMongoDB(userCredential.user);
      
    } catch (error) {
      setErrorMessage(error.message);
      setIsSigningIn(false);
    }
  };

  if (userLoggedIn) return <Navigate to="/home" replace />;

  return (
    <div className="min-h-screen w-full bg-black">
      <div className="w-full min-h-screen bg-[#efe5dc] flex items-center justify-center px-4 sm:px-6">
        {/* Centered container */}
        <div className="relative w-full max-w-md sm:max-w-lg">
          {/* Grid background (soft edges) */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)',
              backgroundSize: '35px 35px',
              WebkitMaskImage:
                'linear-gradient(to right, transparent, black 60%, black 40 %, transparent)',
              maskImage:
                'linear-gradient(to right, transparent, black 40%, black 60%, transparent)',
            }}
          />

          {/* Content */}
          <div className="relative px-6 sm:px-10 py-10 sm:py-12 text-center">
            {/* Logo placeholder */}
            <div className="mb-8 flex justify-center">
              <Link
                to="/"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-black bg-white text-sm font-semibold tracking-tight hover:scale-105 transition-transform"
              >
                TP.
              </Link>
            </div>

            {/* Heading */}
            <h1 className="text-2xl sm:text-3xl font-black text-black">
              Log in to your account
            </h1>
            <p className="mt-2 text-sm sm:text-base text-black/60">
              Welcome back! Please enter your details.
            </p>

            {/* Form */}
            <form
              onSubmit={onSubmit}
              className="mt-8 sm:mt-10 text-left space-y-5"
            >
              {/* Email */}
              <div>
                <label className="text-sm font-medium text-black/70">
                  Email
                </label>
                <input
                  type="email"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={isSigningIn}
                  className="mt-1 w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-[#f57c00] focus:border-transparent"
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium text-black/70">
                  Password
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isSigningIn}
                  className="mt-1 w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-[#f57c00] focus:border-transparent"
                />
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-black/70">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={() => setRemember(!remember)}
                    className="rounded border-black/30 text-[#f57c00] focus:ring-[#f57c00]"
                  />
                  Remember for 30 days
                </label>

                <Link
                  to="/forgot-password"
                  className="text-[#d96d00] hover:underline font-medium"
                >
                  Forgot password
                </Link>
              </div>

              {/* Error */}
              {errorMessage && (
                <p className="text-sm text-red-600">{errorMessage}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSigningIn}
                className="w-full rounded-full bg-[#f57c00] py-3.5 text-black font-semibold hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSigningIn ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            {/* Google sign-in */}
            <button
              onClick={onGoogleSignIn}
              disabled={isSigningIn}
              className="mt-5 w-full flex items-center justify-center gap-3 rounded-full border border-black/20 bg-white py-3.5 text-sm font-medium text-black hover:bg-gray-50 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              <FcGoogle className="text-lg" />
              Sign in with Google
            </button>

            {/* Footer */}
            <p className="mt-8 text-sm text-black/60">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#d96d00] font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;