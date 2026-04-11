import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { doCreateUserWithEmailAndPassword, doSignInWithGoogle } from './auth';
import { useAuth } from '../../authContext';
import { FcGoogle } from 'react-icons/fc';

const Register = () => {
  const { userLoggedIn } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const createUserInMongoDB = async (firebaseUser) => {
    try {
      const response = await fetch('http://localhost:8090/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: firebaseUser.uid,
          username: username || firebaseUser.email.split('@')[0],
          email: firebaseUser.email
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const mongoUser = await response.json();

      localStorage.setItem("userId", mongoUser.id);

      console.log("Mongo user synced:", mongoUser);

    } catch (error) {
      console.error("MongoDB user creation failed:", error);
    }
  };

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
      
      // Create user in Firebase
      const userCredential = await doCreateUserWithEmailAndPassword(email, password);
      
      // Create user in MongoDB
      await createUserInMongoDB(userCredential.user);
      
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
      
      // Sign in with Google
      const userCredential = await doSignInWithGoogle();
      
      // Create user in MongoDB (will return existing if already exists)
      await createUserInMongoDB(userCredential.user);
      
    } catch (error) {
      setErrorMessage(error.message);
      setIsRegistering(false);
    }
  };

  if (userLoggedIn) return <Navigate to="/home" replace />;

  return (
    <div className="min-h-screen w-full bg-black">
      <div className="w-full min-h-screen bg-[#efe5dc] flex items-center justify-center px-4 sm:px-6">
        <div className="relative w-full max-w-md sm:max-w-lg">
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              WebkitMaskImage:
                'linear-gradient(to right, transparent, black 60%, black 40%, transparent)',
              maskImage:
                'linear-gradient(to right, transparent, black 40%, black 60%, transparent)',
            }}
          />

          <div className="relative px-6 sm:px-10 py-10 sm:py-12 text-center">
            <div className="mb-8 flex justify-center">
              <Link
                to="/"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-black bg-white text-sm font-semibold tracking-tight hover:scale-105 transition-transform"
              >
                TP.
              </Link>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-black">
              Create an account
            </h1>
            <p className="mt-2 text-sm sm:text-base text-black/60">
              Choose a username and secure your account.
            </p>

            <button
              onClick={onGoogleSignIn}
              disabled={isRegistering}
              className="mt-6 w-full flex items-center justify-center gap-3 rounded-full border border-black/20 bg-white py-3.5 text-sm font-medium text-black hover:bg-gray-50 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              <FcGoogle className="text-lg" />
              Sign up with Google
            </button>

            <div className="my-8 flex items-center">
              <div className="flex-grow border-t border-black/20" />
              <span className="mx-4 text-sm text-black/50">OR</span>
              <div className="flex-grow border-t border-black/20" />
            </div>

            <form onSubmit={onSubmit} className="text-left space-y-5">
              <div>
                <label className="text-sm font-medium text-black/70">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-[#f57c00] focus:border-transparent"
                  placeholder="Choose a username"
                  disabled={isRegistering}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black/70">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  autoComplete="off"
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-[#f57c00] focus:border-transparent"
                  placeholder="Enter your email"
                  disabled={isRegistering}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black/70">
                  Password
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-[#f57c00] focus:border-transparent"
                  placeholder="Create a password"
                  disabled={isRegistering}
                />
                <p className="text-xs text-black/50 mt-1">
                  Must be at least 6 characters.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-black/70">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-[#f57c00] focus:border-transparent"
                  placeholder="Confirm your password"
                  disabled={isRegistering}
                />
              </div>

              {errorMessage && (
                <p className="text-sm text-red-600">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full rounded-full bg-[#f57c00] py-3.5 text-black font-semibold hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                {isRegistering ? 'Creating account...' : 'Sign up'}
              </button>
            </form>

            <p className="mt-8 text-sm text-black/60">
              Already have an account?{' '}
              <Link to="/login" className="text-[#d96d00] font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;