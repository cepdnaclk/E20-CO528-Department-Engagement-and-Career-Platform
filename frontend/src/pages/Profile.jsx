import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { Edit2, Save, X, Briefcase, GraduationCap, MapPin } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const isOwnProfile = !id || id === user?._id;

  useEffect(() => {
    if (isOwnProfile) {
      fetchOwnProfile();
    } else {
      fetchUserProfile(id);
    }
  }, [id]);

  const fetchOwnProfile = async () => {
    try { const { data } = await api.get('/auth/me'); setProfile(data); setForm(data); } catch {} setLoading(false);
  };

  const fetchUserProfile = async (userId) => {
    try { const { data } = await api.get(`/auth/users/${userId}`); setProfile(data); } catch {} setLoading(false);
  };

  const saveProfile = async () => {
    try {
      const { data } = await api.put('/auth/me', {
        name: form.name,
        bio: form.bio,
        skills: typeof form.skills === 'string' ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : form.skills,
        registrationNumber: form.registrationNumber,
        graduationYear: form.graduationYear
      });
      setProfile(data);
      updateUser(data);
      setEditing(false);
    } catch {}
  };

  if (loading) return <div className="loading-spinner" />;
  if (!profile) return <div className="empty-state"><h3>User not found</h3></div>;

  return (
    <div className="fade-in">
      <div className="profile-header">
        <div className="avatar avatar-xl">{profile.name?.charAt(0)}</div>
        {editing ? (
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Bio</label><textarea className="form-textarea" value={form.bio || ''} onChange={e => setForm({...form, bio: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Skills (comma-separated)</label><input className="form-input" value={Array.isArray(form.skills) ? form.skills.join(', ') : form.skills || ''} onChange={e => setForm({...form, skills: e.target.value})} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group"><label className="form-label">Reg. Number</label><input className="form-input" value={form.registrationNumber || ''} onChange={e => setForm({...form, registrationNumber: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Graduation Year</label><input className="form-input" value={form.graduationYear || ''} onChange={e => setForm({...form, graduationYear: e.target.value})} /></div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => { setEditing(false); setForm(profile); }}><X size={16} /> Cancel</button>
              <button className="btn btn-primary" onClick={saveProfile}><Save size={16} /> Save</button>
            </div>
          </div>
        ) : (
          <>
            <h2>{profile.name}</h2>
            <div className="profile-role">{profile.role}</div>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
              {profile.registrationNumber && <span>{profile.registrationNumber}</span>}
              {profile.department && <span><MapPin size={12} style={{ display: 'inline' }}/> {profile.department}</span>}
            </div>
            {profile.bio && <div className="profile-bio">{profile.bio}</div>}
            {profile.skills?.length > 0 && (
              <div className="profile-skills">
                {profile.skills.map((s, i) => <span key={i} className="badge badge-primary">{s}</span>)}
              </div>
            )}
            {isOwnProfile && (
              <button className="btn btn-secondary" style={{ marginTop: '20px' }} onClick={() => setEditing(true)}><Edit2 size={16} /> Edit Profile</button>
            )}
          </>
        )}
      </div>

      <div className="profile-grid">
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><GraduationCap size={20} /> Education</h3>
          {profile.education?.length > 0 ? profile.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: i < profile.education.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 600 }}>{edu.institution}</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{edu.degree} in {edu.field}</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{edu.startYear} - {edu.endYear || 'Present'}</p>
            </div>
          )) : <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No education info added</p>}
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Briefcase size={20} /> Work Experience</h3>
          {profile.workHistory?.length > 0 ? profile.workHistory.map((work, i) => (
            <div key={i} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: i < profile.workHistory.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 600 }}>{work.position}</h4>
              <p style={{ fontSize: '14px', color: 'var(--accent-primary)' }}>{work.company}</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{work.startDate} - {work.current ? 'Present' : work.endDate}</p>
            </div>
          )) : <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No work experience added</p>}
        </div>
      </div>

      <div className="card" style={{ padding: '24px', marginTop: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Account Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', fontSize: '14px' }}>
          <div><span style={{ color: 'var(--text-muted)' }}>Email</span><p style={{ fontWeight: 500 }}>{profile.email}</p></div>
          <div><span style={{ color: 'var(--text-muted)' }}>University</span><p style={{ fontWeight: 500 }}>{profile.university || 'N/A'}</p></div>
          <div><span style={{ color: 'var(--text-muted)' }}>Member since</span><p style={{ fontWeight: 500 }}>{new Date(profile.createdAt).toLocaleDateString()}</p></div>
          {profile.graduationYear && <div><span style={{ color: 'var(--text-muted)' }}>Graduation Year</span><p style={{ fontWeight: 500 }}>{profile.graduationYear}</p></div>}
        </div>
      </div>
    </div>
  );
}
