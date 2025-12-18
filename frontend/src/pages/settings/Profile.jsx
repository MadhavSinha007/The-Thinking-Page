import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../authContext';
import { doSignOut } from '../auth/auth';
import { FiUser, FiMail, FiEdit2, FiCheck, FiX, FiLogOut, FiTrash2 } from 'react-icons/fi';

const Profile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [tempUsername, setTempUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);

  // Fetch user profile on mount
  useEffect(() => {
    if (currentUser) {
      fetchUserProfile();
    }
  }, [currentUser]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8090/api/users/firebase/${currentUser.uid}`);
      
      if (response.ok) {
        const data = await response.json();
        setUsername(data.username);
        setEmail(data.email);
        setUserId(data.id);
      } else {
        // Auto-create user if not found
        const createRes = await fetch("http://localhost:8090/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firebaseUid: currentUser.uid,
            username: currentUser.displayName || currentUser.email.split("@")[0],
            email: currentUser.email
          })
        });
        const newUser = await createRes.json();
        setUsername(newUser.username);
        setEmail(newUser.email);
        setUserId(newUser.id);
      }
    } catch (err) {
      setError('Failed to load profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Save username
  const saveUsername = async () => {
    if (tempUsername.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (!userId) {
      setError('User profile not found in database');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:8090/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: tempUsername })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update username');
      }

      setUsername(tempUsername);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await doSignOut();
      navigate('/login');
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    )
      return;

    if (
      !window.confirm(
        "This will permanently delete all your data including saved books and comments. Are you absolutely sure?"
      )
    )
      return;

    setError("");

    try {
      // 1️⃣ Delete from MongoDB
      if (userId) {
        const res = await fetch(`http://localhost:8090/api/users/${userId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || "Failed to delete user from database");
        }
      }

      // 2️⃣ Delete Firebase user
      await currentUser.delete().catch((err) => {
        if (err.code === "auth/requires-recent-login") {
          throw new Error(
            "You need to log in again before deleting your account. Please log out and log back in."
          );
        } else {
          throw err;
        }
      });

      // 3️⃣ Redirect
      navigate("/register");
    } catch (err) {
      setError("Failed to delete account: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
      <p className="text-gray-600 mb-8">Manage your account settings</p>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-12 text-center">
          <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
            <FiUser className="text-purple-600" size={48} />
          </div>
          <h2 className="text-2xl font-bold text-white">{username}</h2>
          <p className="text-purple-100 text-sm mt-1">{email}</p>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Username */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Username</label>
            {isEditing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-purple-600 outline-none"
                  disabled={saving}
                  autoFocus
                />
                <button
                  onClick={saveUsername}
                  disabled={saving}
                  className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition"
                  title="Save"
                >
                  <FiCheck size={20} />
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setError('');
                  }}
                  disabled={saving}
                  className="p-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg disabled:opacity-50 transition"
                  title="Cancel"
                >
                  <FiX size={20} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-700 font-medium">
                  {username}
                </div>
                <button
                  onClick={() => {
                    setTempUsername(username);
                    setIsEditing(true);
                    setError('');
                  }}
                  className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                  title="Edit username"
                >
                  <FiEdit2 size={20} />
                </button>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Username must be at least 3 characters
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Email Address</label>
            <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3">
              <FiMail className="text-gray-500" size={20} />
              <span className="text-gray-700 font-medium">{email}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          {/* Account Actions */}
          <div className="border-t pt-6 space-y-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition"
            >
              <FiLogOut size={20} />
              Log Out
            </button>
            <button
              onClick={handleDeleteAccount}
              className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition"
            >
              <FiTrash2 size={20} />
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Member Since */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Member since {new Date(currentUser?.metadata?.creationTime).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default Profile;
