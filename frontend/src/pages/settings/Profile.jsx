import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../authContext';
import { doSignOut } from '../auth/auth';
import { FiUser, FiMail, FiEdit2, FiCheck, FiX, FiLogOut } from 'react-icons/fi';

const Profile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [tempUsername, setTempUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsername();
  }, []);

  const fetchUsername = async () => {
    try {
      // Get username from MongoDB
      const response = await fetch(`http://localhost:8090/api/user/${currentUser.uid}`);
      const data = await response.json();
      setUsername(data.username || currentUser.email.split('@')[0]);
    } catch (err) {
      // Fallback to email prefix
      setUsername(currentUser.email.split('@')[0]);
    }
    setLoading(false);
  };

  const saveUsername = async () => {
    if (tempUsername.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    setSaving(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:8090/api/user/${currentUser.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: tempUsername })
      });

      if (!response.ok) throw new Error('Username already taken');
      
      setUsername(tempUsername);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await doSignOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
      <p className="text-gray-600 mb-8">Manage your account</p>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-12 text-center">
          <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
            <FiUser className="text-purple-600" size={48} />
          </div>
          <h2 className="text-2xl font-bold text-white">{username}</h2>
          <p className="text-purple-100 text-sm mt-1">{currentUser?.email}</p>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          
          {/* Error */}
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
                />
                <button
                  onClick={saveUsername}
                  disabled={saving}
                  className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  <FiCheck size={20} />
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  className="p-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg"
                >
                  <FiX size={20} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-700">
                  {username}
                </div>
                <button
                  onClick={() => {
                    setTempUsername(username);
                    setIsEditing(true);
                    setError('');
                  }}
                  className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                >
                  <FiEdit2 size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Email</label>
            <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3">
              <FiMail className="text-gray-500" size={20} />
              <span className="text-gray-700">{currentUser?.email}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div className="border-t pt-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold"
            >
              <FiLogOut size={20} />
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;