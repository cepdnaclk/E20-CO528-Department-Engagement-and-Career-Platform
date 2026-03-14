import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, FileText, Briefcase, Calendar, TrendingUp, Award } from 'lucide-react';

export default function Analytics() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [postStats, setPostStats] = useState([]);
  const [jobStats, setJobStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [ovRes, postRes, jobRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/posts'),
        api.get('/analytics/jobs')
      ]);
      setOverview(ovRes.data);
      setPostStats(postRes.data);
      setJobStats(jobRes.data);
    } catch {}
    setLoading(false);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="empty-state">
        <h3>Access Denied</h3>
        <p>Analytics dashboard is only available to administrators.</p>
      </div>
    );
  }

  if (loading) return <div className="loading-spinner" />;

  const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#10b981'];

  const pieData = overview ? [
    { name: 'Students', value: overview.userBreakdown.students },
    { name: 'Alumni', value: overview.userBreakdown.alumni },
    { name: 'Admins', value: overview.userBreakdown.admins }
  ] : [];

  const statCards = overview ? [
    { icon: Users, label: 'Total Users', value: overview.totalUsers, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { icon: FileText, label: 'Total Posts', value: overview.totalPosts, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
    { icon: Briefcase, label: 'Job Listings', value: overview.totalJobs, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { icon: Calendar, label: 'Events', value: overview.totalEvents, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { icon: TrendingUp, label: 'Research Projects', value: overview.totalProjects, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' }
  ] : [];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div><h1>Analytics Dashboard</h1><p>Platform insights and engagement metrics</p></div>
      </div>

      {/* Stats Cards */}
      <div className="analytics-grid">
        {statCards.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: stat.bg }}>
              <stat.icon size={24} style={{ color: stat.color }} />
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* User Distribution */}
        <div className="card chart-card">
          <h3>User Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} innerRadius={60} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Posts by Engagement */}
        <div className="card chart-card">
          <h3>Top Posts by Engagement</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={postStats.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="author" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9' }} />
              <Bar dataKey="likes" fill="#6366f1" radius={[4, 4, 0, 0]} name="Likes" />
              <Bar dataKey="comments" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Comments" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Job Applications */}
        <div className="card chart-card">
          <h3>Job Applications</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={jobStats.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis dataKey="title" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={120} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9' }} />
              <Bar dataKey="applications" fill="#10b981" radius={[0, 4, 4, 0]} name="Applications" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity Table */}
        <div className="card chart-card">
          <h3><Award size={18} style={{ display: 'inline', marginRight: '8px' }} />Platform Summary</h3>
          <div style={{ fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Most Engaged Post</span>
              <span style={{ fontWeight: 600 }}>{postStats[0]?.engagement || 0} interactions</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Job Applications</span>
              <span style={{ fontWeight: 600 }}>{jobStats.reduce((a, j) => a + j.applications, 0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Student/Alumni Ratio</span>
              <span style={{ fontWeight: 600 }}>
                {overview?.userBreakdown.students || 0}:{overview?.userBreakdown.alumni || 0}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Active Research Projects</span>
              <span style={{ fontWeight: 600 }}>{overview?.totalProjects || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
