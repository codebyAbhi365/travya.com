import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('travya_current_user') || 'null') } catch (_) { return null }
  })();
  const verifiedPublic = !!localStorage.getItem('travya_public_verified');
  const verifiedPolice = !!localStorage.getItem('travya_police_verified');
  const logout = () => { localStorage.removeItem('travya_current_user'); navigate('/login'); };
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #EEF4FF 0%, #FFFFFF 35%, #FFFFFF 100%)', paddingBottom: 100 }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: 20 }}>
        <h1 style={{ marginTop: 0 }}>Profile</h1>
        {!user ? (
          <div style={{ background: '#fff', border: '1px solid #E6EAF2', borderRadius: 12, padding: 16 }}>
            <div style={{ marginBottom: 8 }}>You are not signed in.</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={btnPrimary} onClick={() => navigate('/login')}>Login</button>
              <button style={btnGhost} onClick={() => navigate('/register')}>Register</button>
            </div>
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #E6EAF2', borderRadius: 12, padding: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{user.name || 'User'}</div>
            <div style={{ color: '#5B6472' }}>Email: {user.email}</div>
            <div style={{ marginTop: 10, display: 'grid', gap: 6 }}>
              <div><b>Public Verification:</b> {verifiedPublic ? 'Verified ✅' : 'Not Verified'}</div>
              <div><b>Police Verification:</b> {verifiedPolice ? 'Verified ✅' : 'Not Verified'}</div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button style={btnGhost} onClick={() => navigate('/public')}>Public Dashboard</button>
              <button style={btnGhost} onClick={() => navigate('/police')}>Police Dashboard</button>
              <button style={btnDanger} onClick={logout}>Logout</button>
            </div>
          </div>
        )}
      </div>

      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, background: '#FFFFFF', borderTop: '1px solid #E6EAF2', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: '10px 20px 14px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        <button style={tabStyle} onClick={() => navigate('/apphome')}><div style={iconStyle}>🏠</div><span style={textStyle}>Home</span></button>
        <button style={tabStyle} onClick={() => navigate('/services')}><div style={iconStyle}>🧭</div><span style={textStyle}>Services</span></button>
        <button style={tabStyle} onClick={() => navigate('/aichat')}><div style={iconStyle}>💬</div><span style={textStyle}>AI Chat</span></button>
        <button style={tabStyle} onClick={() => navigate('/profile')}><div style={iconStyle}>👤</div><span style={textStyle}>Profile</span></button>
      </div>
    </div>
  );
}

const tabStyle = { background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 6, cursor: 'pointer' };
const iconStyle = { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: '#F3F6FF' };
const textStyle = { fontSize: 12 };
const btnPrimary = { padding: '8px 10px', borderRadius: 10, border: '1px solid #2563EB22', background: '#2563EB', color: '#fff', cursor: 'pointer' };
const btnGhost = { padding: '8px 10px', borderRadius: 10, border: '1px solid #E6EAF2', background: '#fff', cursor: 'pointer' };
const btnDanger = { padding: '8px 10px', borderRadius: 10, border: '1px solid #fecaca', background: '#ef4444', color: '#fff', cursor: 'pointer' };


