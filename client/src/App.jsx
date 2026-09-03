import React, { useState, useEffect, useRef } from 'react';
import { getMe, login, register, getRooms, getRoomById, getMessages, sendMessage, leaveRoom, removeMemberFromRoom, connectSocket, disconnectSocket } from './services';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import MembersList from './components/MembersList';
import CreateRoomModal from './components/CreateRoomModal';
import ProfileModal from './components/ProfileModal';
import AddMemberModal from './components/AddMemberModal';
import MediaUploadModal from './components/MediaUploadModal';
import ConfirmModal from './components/ConfirmModal';
import { LogOut, ShieldCheck, Menu } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(true);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [authError, setAuthError] = useState('');

  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [typingText, setTypingText] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  // Modals State
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    confirmVariant: 'danger',
    onConfirm: null
  });
  
  // Mobile Responsive States
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileMembersOpen, setIsMobileMembersOpen] = useState(false);

  const socketRef = useRef(null);
  const currentRoomRef = useRef(currentRoom);

  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);

  // Restore Session on Mount
  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem('chat_jwt_token');
      if (token) {
        try {
          const res = await getMe();
          if (res.success && res.data) {
            handleUserAuthSuccess(res.data, token);
          } else {
            localStorage.removeItem('chat_jwt_token');
            setAuthModalOpen(true);
          }
        } catch {
          setAuthModalOpen(true);
        }
      } else {
        setAuthModalOpen(true);
      }
    }
    checkAuth();
  }, []);

  function handleUserAuthSuccess(user, token) {
    setCurrentUser(user);
    setAuthModalOpen(false);
    
    // Connect socket
    const socket = connectSocket(
      token,
      () => setIsConnected(true),
      () => setIsConnected(false),
      () => setIsConnected(false)
    );
    socketRef.current = socket;

    // Attach socket listeners
    socket.on('message:new', (newMsg) => {
      if (currentRoomRef.current && newMsg.room_id === currentRoomRef.current.id) {
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }
    });

    socket.on('typing:update', (data) => {
      if (data.isTyping && data.userId !== user.id) {
        setTypingText(`✍️ ${data.username || 'Someone'} is typing...`);
      } else {
        setTypingText('');
      }
    });

    // Real-Time User Presence Broadcast Listeners
    socket.on('user:online', (data) => {
      if (data && data.userId) {
        setMembers(prev => prev.map(m => m.id === data.userId ? { ...m, is_online: Boolean(data.isOnline) } : m));
      }
    });

    socket.on('user:offline', (data) => {
      if (data && data.userId) {
        setMembers(prev => prev.map(m => m.id === data.userId ? { ...m, is_online: false } : m));
      }
    });

    // Fetch initial rooms
    fetchRooms();
  }

  async function fetchRooms() {
    try {
      const res = await getRooms();
      if (res.success && Array.isArray(res.data)) {
        setRooms(res.data);
        if (res.data.length > 0) {
          const savedRoomId = localStorage.getItem('chat_active_room_id');
          const targetRoom = res.data.find(r => r.id === savedRoomId) || res.data[0];
          handleSelectRoom(targetRoom);
        }
      }
    } catch (err) {
      console.error('Failed to fetch rooms', err);
    }
  }

  async function handleSelectRoom(room) {
    if (currentRoomRef.current && socketRef.current) {
      socketRef.current.emit('room:leave', { roomId: currentRoomRef.current.id });
    }

    setCurrentRoom(room);
    localStorage.setItem('chat_active_room_id', room.id);
    setMessages([]);
    setTypingText('');

    if (socketRef.current) {
      socketRef.current.emit('room:join', { roomId: room.id });
    }

    // Fetch message history and members
    try {
      const [msgRes, roomRes] = await Promise.all([
        getMessages(room.id),
        getRoomById(room.id)
      ]);

      if (msgRes.success) {
        const rawList = Array.isArray(msgRes.data)
          ? msgRes.data
          : (msgRes.data?.data && Array.isArray(msgRes.data.data) ? msgRes.data.data : []);
        setMessages([...rawList].reverse());
      }
      if (roomRes.success && roomRes.data?.members) {
        setMembers(roomRes.data.members);
      }
    } catch (err) {
      console.error('Error loading room data:', err);
    }
  }

  function handleRoomCreated(newRoom) {
    setRooms(prev => [newRoom, ...prev]);
    handleSelectRoom(newRoom);
  }

  function handleRoomJoined(room) {
    setRooms(prev => {
      if (prev.some(r => r.id === room.id)) return prev;
      return [room, ...prev];
    });
    handleSelectRoom(room);
  }

  function handleProfileUpdated(updatedUser) {
    setCurrentUser(prev => ({ ...prev, ...updatedUser }));
  }

  function handleRoomLeft(roomId) {
    setRooms(prev => prev.filter(r => r.id !== roomId));
    if (currentRoom && currentRoom.id === roomId) {
      setCurrentRoom(null);
      setMessages([]);
      setMembers([]);
    }
  }

  function handleMemberAdded(newUser) {
    setMembers(prev => {
      if (prev.some(m => m.id === newUser.id)) return prev;
      return [...prev, newUser];
    });
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthError('');

    if (authMode === 'login') {
      if (!email || !password) {
        setAuthError('Email and Password are required.');
        return;
      }
      try {
        const res = await login(email, password);
        if (res.success && res.data?.token) {
          localStorage.setItem('chat_jwt_token', res.data.token);
          handleUserAuthSuccess(res.data.user, res.data.token);
        } else {
          setAuthError(res.message || 'Invalid login credentials.');
        }
      } catch (err) {
        setAuthError(`Server connection error: ${err.message}`);
      }
    } else {
      if (!username || !email || !password) {
        setAuthError('Username, Email, and Password are required.');
        return;
      }
      try {
        const res = await register(username, email, password);
        if (res.success && res.data?.token) {
          localStorage.setItem('chat_jwt_token', res.data.token);
          handleUserAuthSuccess(res.data.user, res.data.token);
        } else {
          setAuthError(res.message || 'Registration failed.');
        }
      } catch (err) {
        setAuthError(`Server connection error: ${err.message}`);
      }
    }
  }

  function handleLogout() {
    localStorage.removeItem('chat_jwt_token');
    disconnectSocket();
    socketRef.current = null;
    setIsConnected(false);
    setCurrentUser(null);
    setCurrentRoom(null);
    setMessages([]);
    setMembers([]);
    setAuthModalOpen(true);
  }

  function triggerLogoutConfirm() {
    setConfirmState({
      isOpen: true,
      title: 'Confirm Logout',
      message: 'Are you sure you want to log out of SharePulse?',
      confirmText: 'Log Out',
      confirmVariant: 'danger',
      onConfirm: () => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
        handleLogout();
      }
    });
  }

  function triggerLeaveRoomConfirm(room) {
    setConfirmState({
      isOpen: true,
      title: 'Leave Room',
      message: `Are you sure you want to leave #${room.name}?`,
      confirmText: 'Leave Room',
      confirmVariant: 'danger',
      onConfirm: async () => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
        try {
          const res = await leaveRoom(room.id);
          if (res.success) {
            handleRoomLeft(room.id);
          } else {
            alert(`Failed to leave room: ${res.message}`);
          }
        } catch (err) {
          alert(`Server error: ${err.message}`);
        }
      }
    });
  }

  function triggerRemoveMemberConfirm(member) {
    if (!currentRoom) return;
    setConfirmState({
      isOpen: true,
      title: 'Remove Member',
      message: `Are you sure you want to remove @${member.username} from #${currentRoom.name}?`,
      confirmText: 'Remove Member',
      confirmVariant: 'danger',
      onConfirm: async () => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
        try {
          const targetId = member.id || member.userId;
          const res = await removeMemberFromRoom(currentRoom.id, targetId);
          if (res.success) {
            setMembers(prev => prev.filter(m => m.id !== targetId && m.userId !== targetId));
          } else {
            alert(`Failed to remove member: ${res.message}`);
          }
        } catch (err) {
          alert(`Server error: ${err.message}`);
        }
      }
    });
  }

  async function handleSendMessage(content, mediaUrl = null) {
    if ((!content && !mediaUrl) || !currentRoom) return;

    try {
      const res = await sendMessage(currentRoom.id, content, mediaUrl);
      if (!res.success) {
        alert(`Failed to send message: ${res.message}`);
      }
    } catch (err) {
      alert(`Network error: ${err.message}`);
    }
  }

  function handleTypingStart() {
    if (socketRef.current && currentRoom) {
      socketRef.current.emit('typing:start', { roomId: currentRoom.id });
    }
  }

  function handleTypingStop() {
    if (socketRef.current && currentRoom) {
      socketRef.current.emit('typing:stop', { roomId: currentRoom.id });
    }
  }

  function handleAttachMedia(imageUrl) {
    handleSendMessage(null, imageUrl);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      
      {/* App Header */}
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button className="mobile-menu-btn" onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}>
            <Menu size={20} />
          </button>
          <h1><span>⚡</span> SharePulse</h1>
        </div>
        
        {currentUser && (
          <div className="user-profile-bar">
            <div 
              className="profile-clickable-area" 
              onClick={() => setIsProfileModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
            >
              <div className="avatar-badge">
                {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="profile-info">
                <span className="profile-name">{currentUser.username}</span>
                <span className="profile-email">{currentUser.email}</span>
              </div>
            </div>
            <button className="sec" onClick={triggerLogoutConfirm} style={{ padding: '0.3rem 0.65rem', fontSize: '0.8rem', borderRadius: '20px' }}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        )}
      </header>

      {/* Main Grid */}
      <div className="app-container">
        
        {/* Left Sidebar */}
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          rooms={rooms}
          currentRoom={currentRoom}
          onSelectRoom={(r) => { handleSelectRoom(r); setIsMobileSidebarOpen(false); }}
          onOpenCreateModal={() => setIsCreateRoomOpen(true)}
          onRoomLeft={handleRoomLeft}
          onRequestLeaveRoom={triggerLeaveRoomConfirm}
        />

        {/* Center Chat Window Component */}
        <ChatWindow
          currentRoom={currentRoom}
          messages={messages}
          currentUser={currentUser}
          isConnected={isConnected}
          typingText={typingText}
          onSendMessage={handleSendMessage}
          onTypingStart={handleTypingStart}
          onTypingStop={handleTypingStop}
          onOpenAddMemberModal={() => setIsAddMemberOpen(true)}
          onOpenMediaModal={() => setIsMediaModalOpen(true)}
          onToggleMembers={() => setIsMobileMembersOpen(!isMobileMembersOpen)}
          onLeaveRoom={triggerLeaveRoomConfirm}
        />

        {/* Right Members Sidebar (Phase 4 Component) */}
        <MembersList 
          members={members}
          currentRoom={currentRoom}
          currentUser={currentUser}
          isOpen={isMobileMembersOpen}
          onClose={() => setIsMobileMembersOpen(false)}
          onRemoveMember={triggerRemoveMemberConfirm}
        />

      </div>

      {/* Modals */}
      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        onRoomCreated={handleRoomCreated}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onProfileUpdated={handleProfileUpdated}
      />

      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        currentRoom={currentRoom}
        existingMembers={members}
        onMemberAdded={handleMemberAdded}
      />

      <MediaUploadModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onAttachMedia={handleAttachMedia}
      />

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        confirmVariant={confirmState.confirmVariant}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Auth Modal Overlay */}
      {authModalOpen && (
        <div className="modal-overlay">
          <div className="auth-modal">
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <ShieldCheck color="var(--primary)" /> SharePulse
            </h2>

            {/* Auth Tabs */}
            <div className="auth-tabs">
              <button className={`auth-tab ${authMode === 'login' ? 'active' : ''}`} onClick={() => setAuthMode('login')}>
                Sign In
              </button>
              <button className={`auth-tab ${authMode === 'register' ? 'active' : ''}`} onClick={() => setAuthMode('register')}>
                Register
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {authMode === 'register' && (
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    id="username"
                    type="text"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" style={{ width: '100%', marginTop: '0.5rem' }}>
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {authError && (
              <div style={{ color: 'var(--danger)', fontSize: '0.82rem', textAlign: 'center' }}>
                {authError}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
