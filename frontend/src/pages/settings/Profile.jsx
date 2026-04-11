import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../authContext';
import { doSignOut } from '../auth/auth';
import { FiUser, FiMail, FiEdit2, FiCheck, FiX, FiLogOut, FiTrash2 } from 'react-icons/fi';

const Profile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { darkMode = false } = useOutletContext();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [tempUsername, setTempUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);

  // Theme colors based on dark mode
  const bgColor = darkMode ? '#111110' : '#efe5dc';
  const surfaceColor = darkMode ? '#1C1917' : '#f3ebe3';
  const surface2Color = darkMode ? '#292524' : '#ffffff';
  const textColor = darkMode ? '#F5F0EB' : '#000000';
  const textMuted = darkMode ? '#A8A29E' : '#00000099';
  const textSubtle = darkMode ? '#57534E' : '#00000066';
  const borderColor = darkMode ? '#292524' : '#0000001a';
  const accentColor = '#f57c00';
  const accentSoft = darkMode ? '#3D1410' : '#f57c0015';

  useEffect(() => { 
    if (currentUser) fetchUserProfile(); 
  }, [currentUser]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8090/api/users/firebase/${currentUser.uid}`);
      if (res.ok) {
        const data = await res.json();
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
          }),
        });
        const u = await createRes.json();
        setUsername(u.username); 
        setEmail(u.email); 
        setUserId(u.id);
      }
    } catch { 
      setError('Failed to load profile'); 
    } finally { 
      setLoading(false); 
    }
  };

  const saveUsername = async () => {
    if (tempUsername.length < 3) return setError('Username must be at least 3 characters');
    setSaving(true); 
    setError('');
    try {
      const res = await fetch(`http://localhost:8090/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: tempUsername }),
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
    if (!window.confirm('Delete your account permanently? This action cannot be undone.')) return;
    try {
      if (userId) await fetch(`http://localhost:8090/api/users/${userId}`, { method: 'DELETE' });
      await currentUser.delete();
      navigate('/register');
    } catch { 
      setError('Delete failed'); 
    }
  };

  if (loading) return (
    <div className="min-h-screen w-full bg-black">
      <div className="w-full min-h-screen flex items-center justify-center" style={{ background: bgColor }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent mb-4" 
               style={{ borderColor: borderColor, borderTopColor: accentColor }} />
          <p className="font-medium" style={{ color: textColor }}>Loading profile...</p>
        </div>
      </div>
    </div>
  );

  // Avatar initials
  const initials = (username || email || 'R').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen w-full bg-black">
      <div className="w-full min-h-screen pb-16" style={{ background: bgColor }}>
        <div className="max-w-lg mx-auto px-5 sm:px-8 pt-8">

          {/* Avatar + name */}
          <div className="flex flex-col items-center text-center mb-10">
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center mb-5 text-2xl font-black transition-all hover:scale-105"
              style={{ background: accentColor, color: '#000000' }}
            >
              {initials}
            </div>
            <h1 className="text-2xl font-black mb-1" style={{ color: textColor }}>{username}</h1>
            <p className="text-sm" style={{ color: textMuted }}>{email}</p>
            <p className="text-xs mt-1" style={{ color: textSubtle }}>
              Member since {new Date(currentUser?.metadata?.creationTime).toLocaleDateString()}
            </p>
          </div>

          {/* Card */}
          <div
            className="rounded-3xl p-6 sm:p-8 space-y-6"
            style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}
          >
            {error && (
              <div
                className="text-sm px-4 py-3 rounded-xl"
                style={{ background: '#FEE2E2', color: '#DC2626' }}
              >
                {error}
              </div>
            )}

            {/* Username field */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-3" style={{ color: textSubtle }}>
                Username
              </label>
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    value={tempUsername}
                    onChange={e => setTempUsername(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium outline-none transition-all"
                    style={{
                      background: surface2Color,
                      border: `1.5px solid ${accentColor}`,
                      color: textColor,
                    }}
                    placeholder="Enter username"
                    autoFocus
                  />
                  <button
                    onClick={saveUsername}
                    disabled={saving}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-black transition-all hover:scale-105"
                    style={{ background: '#22C55E' }}
                  >
                    <FiCheck size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setError('');
                    }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                    style={{ background: surface2Color, color: textMuted }}
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold" style={{ color: textColor }}>{username}</span>
                  <button
                    onClick={() => { 
                      setTempUsername(username); 
                      setIsEditing(true); 
                      setError('');
                    }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                    style={{ color: accentColor, background: accentSoft }}
                  >
                    <FiEdit2 size={15} />
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ borderTop: `1px solid ${borderColor}` }} />

            {/* Email field */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-3" style={{ color: textSubtle }}>
                Email
              </label>
              <div className="flex items-center gap-2.5">
                <FiMail size={15} style={{ color: textMuted, flexShrink: 0 }} />
                <span className="text-sm font-medium" style={{ color: textMuted }}>{email}</span>
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: `1px solid ${borderColor}` }} />

            {/* Stats */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-3" style={{ color: textSubtle }}>
                Account Info
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <FiUser size={15} style={{ color: textMuted, flexShrink: 0 }} />
                  <span className="text-sm font-medium" style={{ color: textMuted }}>
                    User ID: {userId?.slice(0, 8)}...
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: `1px solid ${borderColor}` }} />

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleLogout}
                className="w-full py-3 rounded-full text-sm font-black text-black flex items-center justify-center gap-2 transition-all hover:scale-105"
                style={{ background: accentColor }}
              >
                <FiLogOut size={16} />
                Logout
              </button>

              <button
                onClick={handleDeleteAccount}
                className="w-full py-3 rounded-full text-sm font-black flex items-center justify-center gap-2 transition-all border-2 hover:scale-105"
                style={{ 
                  color: '#EF4444', 
                  borderColor: '#EF4444', 
                  background: 'transparent' 
                }}
                onMouseEnter={e => { 
                  e.currentTarget.style.background = '#EF4444'; 
                  e.currentTarget.style.color = '#fff'; 
                }}
                onMouseLeave={e => { 
                  e.currentTarget.style.background = 'transparent'; 
                  e.currentTarget.style.color = '#EF4444'; 
                }}
              >
                <FiTrash2 size={16} />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;