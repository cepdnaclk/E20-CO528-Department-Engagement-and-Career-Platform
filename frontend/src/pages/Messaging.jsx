import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { io } from 'socket.io-client';
import { Send, MessageCircle, Plus, X } from 'lucide-react';

export default function Messaging() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [users, setUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    socketRef.current = io(window.location.origin, { transports: ['websocket', 'polling'] });
    socketRef.current.on('new_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => socketRef.current?.disconnect();
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchConversations = async () => {
    try { const { data } = await api.get('/messages/conversations'); setConversations(data); } catch {} setLoading(false);
  };

  const selectConversation = async (conv) => {
    setActiveConv(conv);
    socketRef.current?.emit('join_room', conv.roomId);
    try { const { data } = await api.get(`/messages/${conv.roomId}`); setMessages(data); } catch {}
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConv) return;
    const other = activeConv.participants?.find(p => (p._id || p) !== user?._id);
    try {
      await api.post('/messages', { receiverId: other?._id || other, content: newMessage, roomId: activeConv.roomId });
      setNewMessage('');
      fetchConversations();
    } catch {}
  };

  const startNewConversation = async (otherUser) => {
    try {
      const { data } = await api.post('/messages/conversations', { participantId: otherUser._id });
      setShowNew(false);
      fetchConversations();
      selectConversation(data);
    } catch {}
  };

  const fetchUsers = async () => {
    try { const { data } = await api.get('/auth/users'); setUsers(data.filter(u => u._id !== user?._id)); } catch {}
  };

  const getOtherParticipant = (conv) => conv.participants?.find(p => (p._id || p) !== user?._id) || {};

  return (
    <div className="messaging-layout fade-in">
      <div className="conversations-panel">
        <div className="conversations-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3>Messages</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => { setShowNew(true); fetchUsers(); }}><Plus size={18} /></button>
          </div>
        </div>
        {conversations.map(conv => {
          const other = getOtherParticipant(conv);
          return (
            <div key={conv._id} className={`conversation-item ${activeConv?._id === conv._id ? 'active' : ''}`} onClick={() => selectConversation(conv)}>
              <div className="avatar avatar-sm">{other?.name?.charAt(0) || '?'}</div>
              <div className="conversation-info">
                <h4>{other?.name || 'User'}</h4>
                <p>{conv.lastMessage || 'No messages yet'}</p>
              </div>
            </div>
          );
        })}
        {conversations.length === 0 && !loading && (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
            No conversations yet. Start one!
          </div>
        )}
      </div>

      <div className="chat-panel">
        {activeConv ? (
          <>
            <div className="chat-header">
              <div className="avatar avatar-sm">{getOtherParticipant(activeConv)?.name?.charAt(0) || '?'}</div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 600 }}>{getOtherParticipant(activeConv)?.name || 'User'}</h4>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{getOtherParticipant(activeConv)?.role || ''}</span>
              </div>
            </div>
            <div className="chat-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`message-bubble ${(msg.sender?._id || msg.sender) === user?._id ? 'sent' : 'received'}`}>
                  <div>{msg.content}</div>
                  <div className="message-time">{new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input-area">
              <input placeholder="Type a message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
              <button className="btn btn-primary" onClick={sendMessage}><Send size={18} /></button>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <div style={{ textAlign: 'center' }}>
              <MessageCircle size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
              <p>Select a conversation or start a new one</p>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNew && (
        <div className="modal-overlay" onClick={() => setShowNew(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header"><h3>New Message</h3><button className="btn btn-ghost" onClick={() => setShowNew(false)}><X size={20} /></button></div>
            <div className="modal-body" style={{ maxHeight: '400px', overflow: 'auto' }}>
              {users.map(u => (
                <div key={u._id} className="conversation-item" onClick={() => startNewConversation(u)} style={{ borderRadius: 'var(--radius-sm)' }}>
                  <div className="avatar avatar-sm">{u.name?.charAt(0)}</div>
                  <div className="conversation-info">
                    <h4>{u.name}</h4>
                    <p style={{ textTransform: 'capitalize' }}>{u.role}</p>
                  </div>
                </div>
              ))}
              {users.length === 0 && <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No users found</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
