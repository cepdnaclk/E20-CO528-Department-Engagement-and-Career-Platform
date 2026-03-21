import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Briefcase, MapPin, Clock, DollarSign, Plus, X, Send, Building, Users, FileText, Trash2 } from 'lucide-react';

const API_BASE_URL = (typeof window !== 'undefined' && window.__ENV__?.API_BASE_URL)
  ? window.__ENV__.API_BASE_URL.replace('/api', '')
  : (import.meta.env.VITE_API_BASE_URL || '/api').replace('/api', '');

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showApply, setShowApply] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [form, setForm] = useState({ title: '', company: '', description: '', requirements: '', location: '', type: 'job', salary: '', deadline: '' });
  const [myApps, setMyApps] = useState([]);
  const [showApplicants, setShowApplicants] = useState(null); // { jobTitle, applications[] }
  const [applicantsLoading, setApplicantsLoading] = useState(false);

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
      const formData = new FormData();
      formData.append('coverLetter', coverLetter);
      if (resumeFile) formData.append('resume', resumeFile);
      await api.post(`/jobs/${jobId}/apply`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowApply(null);
      setCoverLetter('');
      setResumeFile(null);
      fetchJobs();
      fetchMyApps();
    } catch {}
  };

  const viewApplicants = async (job) => {
    setApplicantsLoading(true);
    setShowApplicants({ jobTitle: job.title, applications: [] });
    try {
      const { data } = await api.get(`/jobs/${job._id}`);
      setShowApplicants({ jobTitle: data.title, applications: data.applications || [] });
    } catch {}
    setApplicantsLoading(false);
  };

  const deleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting? This cannot be undone.')) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      fetchJobs();
    } catch (err) {
      console.error('Failed to delete job', err);
    }
  };

  const isMyJob = (job) => {
    const posterId = job.postedBy?._id || job.postedBy;
    return posterId?.toString() === user?._id?.toString();
  };

  const hasApplied = (job) => job.applications?.some(a => a.applicant === user?._id || a.applicant?._id === user?._id);

  const filteredJobs = tab === 'all' ? jobs : tab === 'applications' ? [] : jobs.filter(j => j.type === tab);

  if (loading) return <div className="loading-spinner" />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Jobs &amp; Internships</h1>
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
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {isMyJob(job) && (
                    <>
                      <button className="btn btn-secondary btn-sm" onClick={() => viewApplicants(job)}>
                        <Users size={14} /> View Applicants
                      </button>
                      <button className="btn btn-sm" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }} onClick={() => deleteJob(job._id)}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </>
                  )}
                  {user?.role === 'student' && !hasApplied(job) && (
                    <button className="btn btn-primary btn-sm" onClick={() => setShowApply(job._id)}>Apply</button>
                  )}
                  {hasApplied(job) && <span className="badge badge-success">Applied</span>}
                </div>
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
        <div className="modal-overlay" onClick={() => { setShowApply(null); setResumeFile(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Apply for Position</h3><button className="btn btn-ghost" onClick={() => { setShowApply(null); setResumeFile(null); }}><X size={20} /></button></div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Cover Letter (optional)</label>
                <textarea className="form-textarea" placeholder="Tell them why you're a great fit..." value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Upload CV / Resume (optional)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="form-input"
                  style={{ padding: '8px' }}
                  onChange={e => setResumeFile(e.target.files[0] || null)}
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Accepted formats: PDF, DOC, DOCX (max 10MB)</small>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setShowApply(null); setResumeFile(null); }}>Cancel</button>
              <button className="btn btn-primary" onClick={() => applyForJob(showApply)}><Send size={14} /> Submit Application</button>
            </div>
          </div>
        </div>
      )}

      {/* View Applicants Modal */}
      {showApplicants && (
        <div className="modal-overlay" onClick={() => setShowApplicants(null)}>
          <div className="modal" style={{ maxWidth: '700px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Users size={18} style={{ display: 'inline', marginRight: '8px' }} />Applicants for "{showApplicants.jobTitle}"</h3>
              <button className="btn btn-ghost" onClick={() => setShowApplicants(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              {applicantsLoading ? (
                <div className="loading-spinner" />
              ) : showApplicants.applications.length === 0 ? (
                <div className="empty-state" style={{ padding: '32px 0' }}>
                  <Users size={40} />
                  <h3>No applicants yet</h3>
                  <p>Applications will appear here once students apply.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {showApplicants.applications.map((app, i) => (
                    <div key={i} style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', background: 'var(--bg-secondary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {app.applicant?.profilePhoto ? (
                            <img src={API_BASE_URL + app.applicant.profilePhoto} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                              {app.applicant?.name?.[0] || '?'}
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: '600' }}>{app.applicant?.name || 'Unknown'}</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{app.applicant?.email || ''}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={`badge ${app.status === 'pending' ? 'badge-warning' : app.status === 'accepted' ? 'badge-success' : 'badge-info'}`}>{app.status}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(app.appliedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {app.coverLetter && (
                        <div style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-muted)', background: 'var(--bg-primary)', borderRadius: '6px', padding: '10px' }}>
                          <strong style={{ color: 'var(--text-primary)' }}>Cover Letter:</strong>
                          <p style={{ marginTop: '4px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{app.coverLetter}</p>
                        </div>
                      )}
                      {app.resume && (
                        <div style={{ marginTop: '10px' }}>
                          <a href={API_BASE_URL + app.resume} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <FileText size={14} /> View CV
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowApplicants(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
