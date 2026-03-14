import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Briefcase, MapPin, Clock, DollarSign, Plus, X, Send, Building } from 'lucide-react';

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showApply, setShowApply] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [form, setForm] = useState({ title: '', company: '', description: '', requirements: '', location: '', type: 'job', salary: '', deadline: '' });
  const [myApps, setMyApps] = useState([]);

  useEffect(() => { fetchJobs(); if (user?.role === 'student') fetchMyApps(); }, []);

  const fetchJobs = async () => {
    try { const { data } = await api.get('/jobs'); setJobs(data); } catch {} setLoading(false);
  };

  const fetchMyApps = async () => {
    try { const { data } = await api.get('/jobs/my-applications'); setMyApps(data); } catch {}
  };

  const createJob = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, requirements: form.requirements.split(',').map(r => r.trim()).filter(Boolean) };
      await api.post('/jobs', payload);
      setShowModal(false);
      setForm({ title: '', company: '', description: '', requirements: '', location: '', type: 'job', salary: '', deadline: '' });
      fetchJobs();
    } catch {}
  };

  const applyForJob = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/apply`, { coverLetter });
      setShowApply(null);
      setCoverLetter('');
      fetchJobs();
      fetchMyApps();
    } catch {}
  };

  const hasApplied = (job) => job.applications?.some(a => a.applicant === user?._id || a.applicant?._id === user?._id);

  const filteredJobs = tab === 'all' ? jobs : tab === 'applications' ? [] : jobs.filter(j => j.type === tab);

  if (loading) return <div className="loading-spinner" />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Jobs & Internships</h1>
          <p>Find opportunities posted by alumni and industry partners</p>
        </div>
        {(user?.role === 'alumni' || user?.role === 'admin') && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={18} /> Post Job</button>
        )}
      </div>

      <div className="page-tabs">
        {['all', 'job', 'internship', ...(user?.role === 'student' ? ['applications'] : [])].map(t => (
          <button key={t} className={`page-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'all' ? 'All' : t === 'job' ? 'Jobs' : t === 'internship' ? 'Internships' : 'My Applications'}
          </button>
        ))}
      </div>

      {tab === 'applications' ? (
        <div className="jobs-grid">
          {myApps.length === 0 ? (
            <div className="empty-state"><Briefcase /><h3>No applications yet</h3><p>Apply for jobs to see them here</p></div>
          ) : myApps.map((app, i) => (
            <div key={i} className="card job-card">
              <h3>{app.job.title}</h3>
              <div className="company"><Building size={14} style={{ display: 'inline', marginRight: '4px' }}/>{app.job.company}</div>
              <div className="job-meta">
                <span className={`badge ${app.status === 'pending' ? 'badge-warning' : app.status === 'accepted' ? 'badge-success' : 'badge-info'}`}>{app.status}</span>
                <span className="badge badge-primary">{app.job.type}</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Applied {new Date(app.appliedAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="jobs-grid">
          {filteredJobs.map(job => (
            <div key={job._id} className="card job-card">
              <div className="job-meta" style={{ marginBottom: '12px' }}>
                <span className={`badge ${job.type === 'internship' ? 'badge-info' : 'badge-success'}`}>{job.type}</span>
                {job.deadline && <span className="badge badge-warning"><Clock size={10} /> {new Date(job.deadline).toLocaleDateString()}</span>}
              </div>
              <h3>{job.title}</h3>
              <div className="company"><Building size={14} style={{ display: 'inline', marginRight: '4px' }}/>{job.company}</div>
              <div className="job-desc">{job.description}</div>
              <div className="job-meta">
                {job.location && <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} />{job.location}</span>}
                {job.salary && <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><DollarSign size={14} />{job.salary}</span>}
              </div>
              {job.requirements?.length > 0 && (
                <div className="job-requirements" style={{ marginTop: '12px' }}>
                  {job.requirements.map((r, i) => <span key={i} className="req-tag">{r}</span>)}
                </div>
              )}
              <div className="job-card-footer">
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {job.applications?.length || 0} applicants • Posted by {job.postedBy?.name}
                </span>
                {user?.role === 'student' && !hasApplied(job) && (
                  <button className="btn btn-primary btn-sm" onClick={() => setShowApply(job._id)}>Apply</button>
                )}
                {hasApplied(job) && <span className="badge badge-success">Applied</span>}
              </div>
            </div>
          ))}
          {filteredJobs.length === 0 && <div className="empty-state"><Briefcase /><h3>No listings found</h3></div>}
        </div>
      )}

      {/* Create Job Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Post a Job/Internship</h3><button className="btn btn-ghost" onClick={() => setShowModal(false)}><X size={20} /></button></div>
            <form onSubmit={createJob}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Job Title</label><input className="form-input" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Company</label><input className="form-input" required value={form.company} onChange={e => setForm({...form, company: e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" required value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group"><label className="form-label">Type</label><select className="form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}><option value="job">Job</option><option value="internship">Internship</option></select></div>
                  <div className="form-group"><label className="form-label">Location</label><input className="form-input" value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group"><label className="form-label">Salary</label><input className="form-input" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">Deadline</label><input type="date" className="form-input" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} /></div>
                </div>
                <div className="form-group"><label className="form-label">Requirements (comma-separated)</label><input className="form-input" placeholder="React, Node.js, AWS" value={form.requirements} onChange={e => setForm({...form, requirements: e.target.value})} /></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Post Job</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApply && (
        <div className="modal-overlay" onClick={() => setShowApply(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Apply for Position</h3><button className="btn btn-ghost" onClick={() => setShowApply(null)}><X size={20} /></button></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Cover Letter (optional)</label><textarea className="form-textarea" placeholder="Tell them why you're a great fit..." value={coverLetter} onChange={e => setCoverLetter(e.target.value)} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowApply(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => applyForJob(showApply)}><Send size={14} /> Submit Application</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
