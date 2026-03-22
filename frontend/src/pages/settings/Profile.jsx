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

  useEffect(() => {
    if (currentUser) fetchUserProfile();
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
    } catch {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const saveUsername = async () => {
    if (tempUsername.length < 3) return setError('Min 3 characters');
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`http://localhost:8090/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: tempUsername })
      });

      if (!res.ok) throw new Error();

      setUsername(tempUsername);
      setIsEditing(false);
    } catch {
      setError('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await doSignOut();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Delete account permanently?')) return;

    try {
      if (userId) {
        await fetch(`http://localhost:8090/api/users/${userId}`, { method: 'DELETE' });
      }
      await currentUser.delete();
      navigate('/register');
    } catch {
      setError('Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 flex items-center justify-center mb-4 text-white">
            <FiUser size={40} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">{username}</h1>
          <p className="text-gray-500 text-sm mt-1">{email}</p>
        </div>

        {/* Card */}
        <div className="bg-white shadow-xl border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-6">

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {/* Username */}
          <div>
            <label className="text-sm text-gray-600">Username</label>

            {isEditing ? (
              <div className="flex gap-2 mt-2">
                <input
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-purple-600"
                />
                <button onClick={saveUsername} className="p-2 bg-green-600 text-white rounded-lg">
                  <FiCheck />
                </button>
                <button onClick={() => setIsEditing(false)} className="p-2 bg-gray-200 rounded-lg">
                  <FiX />
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center mt-2">
                <span className="text-lg text-gray-800">{username}</span>
                <button onClick={() => { setTempUsername(username); setIsEditing(true); }} className="text-purple-600">
                  <FiEdit2 />
                </button>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <div className="flex items-center gap-2 mt-2 text-gray-700">
              <FiMail />
              <span>{email}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 space-y-3">
            <button
              onClick={handleLogout}
              className="w-full py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 flex items-center justify-center gap-2"
            >
              <FiLogOut /> Logout
            </button>

            <button
              onClick={handleDeleteAccount}
              className="w-full py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center gap-2"
            >
              <FiTrash2 /> Delete Account
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-xs mt-6">
          Member since {new Date(currentUser?.metadata?.creationTime).toLocaleDateString()}
        </div>

      </div>
    </div>
  );
};

export default Profile;
