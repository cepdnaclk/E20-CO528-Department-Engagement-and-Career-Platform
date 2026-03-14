import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Heart, MessageCircle, Send, Trash2, Image } from 'lucide-react';

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await api.get('/feed');
      setPosts(data.posts || []);
    } catch {}
    setLoading(false);
  };

  const createPost = async () => {
    if (!newPost.trim()) return;
    try {
      const { data } = await api.post('/feed', { content: newPost });
      setPosts([data, ...posts]);
      setNewPost('');
    } catch {}
  };

  const likePost = async (postId) => {
    try {
      const { data } = await api.post(`/feed/${postId}/like`);
      setPosts(posts.map(p => p._id === postId ? data : p));
    } catch {}
  };

  const addComment = async (postId) => {
    const content = commentInputs[postId];
    if (!content?.trim()) return;
    try {
      const { data } = await api.post(`/feed/${postId}/comment`, { content });
      setPosts(posts.map(p => p._id === postId ? data : p));
      setCommentInputs({ ...commentInputs, [postId]: '' });
    } catch {}
  };

  const deletePost = async (postId) => {
    try {
      await api.delete(`/feed/${postId}`);
      setPosts(posts.filter(p => p._id !== postId));
    } catch {}
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) return <div className="loading-spinner" />;

  return (
    <div className="feed-layout fade-in">
      <div className="feed-main">
        {/* Create Post */}
        <div className="card create-post">
          <div className="create-post-header">
            <div className="avatar">{user?.name?.charAt(0)}</div>
            <input
              placeholder="What's on your mind?"
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createPost()}
            />
          </div>
          {newPost && (
            <div style={{ padding: '0 24px 16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setNewPost('')}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={createPost}><Send size={14} /> Post</button>
            </div>
          )}
        </div>

        {/* Posts */}
        {posts.map(post => (
          <div key={post._id} className="card post-card slide-up">
            <div className="post-header">
              <div className="avatar">{post.author?.name?.charAt(0)}</div>
              <div className="post-author-info">
                <h4>{post.author?.name}</h4>
                <span>{post.author?.role} • {timeAgo(post.createdAt)}</span>
              </div>
              {(post.author?._id === user?._id || user?.role === 'admin') && (
                <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => deletePost(post._id)}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <div className="post-content">{post.content}</div>
            {post.media?.length > 0 && (
              <div className="post-media">
                {post.media.map((m, i) => <img key={i} src={m} alt="post media" />)}
              </div>
            )}
            <div className="post-stats">
              <span>{post.likes?.length || 0} likes</span>
              <span>{post.comments?.length || 0} comments</span>
            </div>
            <div className="post-actions" style={{ paddingBottom: '12px' }}>
              <button className={`post-action-btn ${post.likes?.includes(user?._id) ? 'liked' : ''}`} onClick={() => likePost(post._id)}>
                <Heart size={18} fill={post.likes?.includes(user?._id) ? 'currentColor' : 'none'} /> Like
              </button>
              <button className="post-action-btn" onClick={() => setCommentInputs({ ...commentInputs, [post._id]: commentInputs[post._id] ?? '' })}>
                <MessageCircle size={18} /> Comment
              </button>
            </div>
            {/* Comments */}
            {(post.comments?.length > 0 || commentInputs[post._id] !== undefined) && (
              <div className="post-comments">
                {post.comments?.map((c, i) => (
                  <div key={i} className="comment-item">
                    <div className="avatar avatar-sm">{c.author?.name?.charAt(0) || '?'}</div>
                    <div className="comment-content">
                      <h5>{c.author?.name || 'User'}</h5>
                      <p>{c.content}</p>
                    </div>
                  </div>
                ))}
                {commentInputs[post._id] !== undefined && (
                  <div className="comment-input-row">
                    <input
                      className="form-input"
                      placeholder="Write a comment..."
                      value={commentInputs[post._id]}
                      onChange={e => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                      onKeyDown={e => e.key === 'Enter' && addComment(post._id)}
                      style={{ borderRadius: '20px', padding: '8px 16px' }}
                    />
                    <button className="btn btn-primary btn-sm" onClick={() => addComment(post._id)}><Send size={14} /></button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {posts.length === 0 && (
          <div className="empty-state">
            <Image size={64} />
            <h3>No posts yet</h3>
            <p>Be the first to share something with the community!</p>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="feed-sidebar">
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div className="avatar avatar-lg">{user?.name?.charAt(0)}</div>
            <div>
              <h4>{user?.name}</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</p>
            </div>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>{user?.bio || 'No bio yet'}</p>
          {user?.skills?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {user.skills.map((s, i) => <span key={i} className="badge badge-primary">{s}</span>)}
            </div>
          )}
        </div>
        <div className="card" style={{ padding: '24px', marginTop: '16px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Quick Links</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
            <a href="/jobs" style={{ color: 'var(--text-secondary)' }}>🔍 Browse Jobs</a>
            <a href="/events" style={{ color: 'var(--text-secondary)' }}>📅 Upcoming Events</a>
            <a href="/research" style={{ color: 'var(--text-secondary)' }}>🔬 Research Projects</a>
          </div>
        </div>
      </div>
    </div>
  );
}
