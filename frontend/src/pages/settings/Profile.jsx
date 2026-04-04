import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../authContext';
import { doSignOut } from '../auth/auth';
import { FiUser, FiMail, FiEdit2, FiCheck, FiX, FiLogOut, FiTrash2 } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

const Profile = () => {
  const { currentUser }                     = useAuth();
  const navigate                            = useNavigate();
  const { theme }                           = useTheme();

  const [username, setUsername]             = useState('');
  const [email, setEmail]                   = useState('');
  const [tempUsername, setTempUsername]     = useState('');
  const [isEditing, setIsEditing]           = useState(false);
  const [loading, setLoading]               = useState(true);
  const [saving, setSaving]                 = useState(false);
  const [error, setError]                   = useState('');
  const [userId, setUserId]                 = useState(null);

  useEffect(() => { if (currentUser) fetchUserProfile(); }, [currentUser]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8090/api/users/firebase/${currentUser.uid}`);
      if (res.ok) {
        const data = await res.json();
        setUsername(data.username); setEmail(data.email); setUserId(data.id);
      } else {
        const createRes = await fetch("http://localhost:8090/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firebaseUid: currentUser.uid, username: currentUser.displayName || currentUser.email.split("@")[0], email: currentUser.email }),
        });
        const u = await createRes.json();
        setUsername(u.username); setEmail(u.email); setUserId(u.id);
      }
    } catch { setError('Failed to load profile'); }
    finally { setLoading(false); }
  };

  const saveUsername = async () => {
    if (tempUsername.length < 3) return setError('Min 3 characters');
    setSaving(true); setError('');
    try {
      const res = await fetch(`http://localhost:8090/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: tempUsername }),
      });
      if (!res.ok) throw new Error();
      setUsername(tempUsername); setIsEditing(false);
    } catch { setError('Update failed'); }
    finally { setSaving(false); }
  };

  const handleLogout = async () => { await doSignOut(); navigate('/login'); };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Delete your account permanently?')) return;
    try {
      if (userId) await fetch(`http://localhost:8090/api/users/${userId}`, { method: 'DELETE' });
      await currentUser.delete();
      navigate('/register');
    } catch { setError('Delete failed'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 rounded-full border-[3px] animate-spin"
        style={{ borderColor: theme.border, borderTopColor: theme.accent }} />
    </div>
  );

  // Avatar initials
  const initials = (username || email || 'R').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen pb-16" style={{ background: theme.bg }}>
      <div className="max-w-lg mx-auto px-5 sm:px-8 pt-8">

        {/* Avatar + name */}
        <div className="flex flex-col items-center text-center mb-10">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center mb-5 text-2xl font-black"
            style={{ background: theme.fg, color: theme.bg }}
          >
            {initials}
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: theme.fg }}>{username}</h1>
          <p className="text-sm" style={{ color: theme.fgMuted }}>{email}</p>
          <p className="text-xs mt-1" style={{ color: theme.fgSubtle }}>
            Member since {new Date(currentUser?.metadata?.creationTime).toLocaleDateString()}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-6 sm:p-8 space-y-6"
          style={{ background: theme.surface, border: `1px solid ${theme.border}` }}
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
            <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: theme.fgSubtle }}>
              Username
            </label>
            {isEditing ? (
              <div className="flex gap-2">
                <input
                  value={tempUsername}
                  onChange={e => setTempUsername(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-2xl text-sm font-medium outline-none transition-all"
                  style={{
                    background: theme.surface2,
                    border: `1.5px solid ${theme.accent}`,
                    color: theme.fg,
                  }}
                  autoFocus
                />
                <button
                  onClick={saveUsername}
                  disabled={saving}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white"
                  style={{ background: '#22C55E' }}
                >
                  <FiCheck size={16} />
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: theme.surface2, color: theme.fgMuted }}
                >
                  <FiX size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold" style={{ color: theme.fg }}>{username}</span>
                <button
                  onClick={() => { setTempUsername(username); setIsEditing(true); }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                  style={{ color: theme.accent, background: theme.accentSoft }}
                >
                  <FiEdit2 size={15} />
                </button>
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ borderTop: `1px solid ${theme.border}` }} />

          {/* Email field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: theme.fgSubtle }}>
              Email
            </label>
            <div className="flex items-center gap-2.5">
              <FiMail size={15} style={{ color: theme.fgMuted, flexShrink: 0 }} />
              <span className="text-sm font-medium" style={{ color: theme.fgMuted }}>{email}</span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: `1px solid ${theme.border}` }} />

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all"
              style={{ background: theme.accent }}
              onMouseEnter={e => (e.currentTarget.style.background = theme.accentHover)}
              onMouseLeave={e => (e.currentTarget.style.background = theme.accent)}
            >
              <FiLogOut size={16} />
              Logout
            </button>

            <button
              onClick={handleDeleteAccount}
              className="w-full py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all border-2"
              style={{ color: '#EF4444', borderColor: '#EF4444', background: 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#EF4444'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#EF4444'; }}
            >
              <FiTrash2 size={16} />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;