import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { FlaskConical, Plus, X, UserPlus, FileText, Users } from 'lucide-react';

export default function Research() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showInvite, setShowInvite] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [form, setForm] = useState({ title: '', description: '', requiredSkills: '' });

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try { const { data } = await api.get('/research'); setProjects(data); } catch {} setLoading(false);
  };

  const createProject = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, requiredSkills: form.requiredSkills.split(',').map(s => s.trim()).filter(Boolean) };
      await api.post('/research', payload);
      setShowModal(false);
      setForm({ title: '', description: '', requiredSkills: '' });
      fetchProjects();
    } catch {}
  };

  const inviteCollaborator = async (projectId) => {
    if (!inviteEmail.trim()) return;
    try {
      await api.post(`/research/${projectId}/invite`, { email: inviteEmail });
      setShowInvite(null);
      setInviteEmail('');
      fetchProjects();
    } catch {}
  };

  if (loading) return <div className="loading-spinner" />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div><h1>Research Collaboration</h1><p>Create and join research projects with peers</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={18} /> New Project</button>
      </div>

      <div className="research-grid">
        {projects.map(project => (
          <div key={project._id} className="card project-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span className={`badge ${project.status === 'active' ? 'badge-success' : project.status === 'completed' ? 'badge-primary' : 'badge-warning'}`}>{project.status}</span>
              {project.owner?._id === user?._id && (
                <button className="btn btn-ghost btn-sm" onClick={() => setShowInvite(project._id)}><UserPlus size={16} /> Invite</button>
              )}
            </div>
            <h3>{project.title}</h3>
            <div className="project-desc">{project.description}</div>
            {project.requiredSkills?.length > 0 && (
              <div className="project-skills">
                {project.requiredSkills.map((s, i) => <span key={i} className="badge badge-primary">{s}</span>)}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <Users size={14} />
                {1 + (project.collaborators?.length || 0)} members
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <FileText size={14} />
                {project.documents?.length || 0} documents
              </div>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              <span>Owner: <strong style={{ color: 'var(--text-secondary)' }}>{project.owner?.name}</strong></span>
              {project.collaborators?.length > 0 && (
                <span> • Collaborators: {project.collaborators.map(c => c.name).join(', ')}</span>
              )}
            </div>
          </div>
        ))}
        {projects.length === 0 && <div className="empty-state"><FlaskConical /><h3>No projects yet</h3><p>Create a research project to get started</p></div>}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>New Research Project</h3><button className="btn btn-ghost" onClick={() => setShowModal(false)}><X size={20} /></button></div>
            <form onSubmit={createProject}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Project Title</label><input className="form-input" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" required value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Required Skills (comma-separated)</label><input className="form-input" placeholder="Python, ML, NLP" value={form.requiredSkills} onChange={e => setForm({...form, requiredSkills: e.target.value})} /></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create Project</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div className="modal-overlay" onClick={() => setShowInvite(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header"><h3>Invite Collaborator</h3><button className="btn btn-ghost" onClick={() => setShowInvite(null)}><X size={20} /></button></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Email Address</label><input className="form-input" type="email" placeholder="colleague@eng.pdn.ac.lk" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} /></div>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowInvite(null)}>Cancel</button><button className="btn btn-primary" onClick={() => inviteCollaborator(showInvite)}>Send Invite</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
