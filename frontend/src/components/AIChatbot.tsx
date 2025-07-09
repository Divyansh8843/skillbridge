import React, { useState, useRef } from 'react';
import axios from 'axios';

import { useAuth } from '../contexts/AuthContext';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  files?: string[];
}

const AIChatbot: React.FC = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modalVisible, setModalVisible] = useState(false);

  React.useEffect(() => {
    if (open) {
      setModalVisible(true);
    } else {
      // Wait for animation before removing from DOM
      const timeout = setTimeout(() => setModalVisible(false), 320);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  if (!user) return null; // Only show for authenticated users

  const handleSend = async () => {
     console.log('handleSend called', input, files);
    if (!input && files.length === 0) return;
    setMessages((msgs) => [...msgs, { sender: 'user', text: input, files: files.map(f => f.name) }]);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('prompt', input);
      files.forEach((file) => formData.append('files', file));
      const token = localStorage.getItem('authToken');
      const res = await axios.post('/api/ai-chatbot', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        
        }
      });
      setMessages((msgs) => [
        ...msgs,
        { sender: 'ai', text: res.data.aiResponse || 'No response from AI.' },
      ]);
      setInput('');
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { sender: 'ai', text: 'Error: Could not get a response from AI Chatbot.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <>
      {/* Floating Chatbot Icon at Bottom Right with Hover Animation */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: 'fixed',
          bottom: 40,
          right: 40,
          zIndex: 1000,
          background: 'rgba(255,255,255,0.92)',
          border: '2.5px solid #6366f1',
          borderRadius: '50%',
          width: 56,
          height: 56,
          boxShadow: '0 6px 32px rgba(99,102,241,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          cursor: 'pointer',
          transition: 'box-shadow 0.25s, background 0.25s, transform 0.25s',
          backdropFilter: 'blur(8px)',
        }}
        aria-label="Open Learning Chatbot"
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.12)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <span role="img" aria-label="Learning Chatbot">🤖</span>
      </button>
      {/* Large, Centered, Creative Chatbot Modal with Animation */}
      {modalVisible && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: open
              ? 'translate(-50%, -50%) scale(1)'
              : 'translate(-50%, -50%) scale(0.92)',
            opacity: open ? 1 : 0,
            width: 'min(700px, 98vw)',
            height: 'min(700px, 98vh)',
            background: 'rgba(245,247,255,0.96)',
            borderRadius: 36,
            boxShadow: '0 16px 64px 0 rgba(99,102,241,0.18)',
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '2.5px solid #6366f1',
            backdropFilter: 'blur(16px)',
            transition: 'opacity 0.32s cubic-bezier(.4,1.3,.6,1), transform 0.32s cubic-bezier(.4,1.3,.6,1)',
            padding: window.innerWidth < 600 ? 0 : undefined,
          }}
        >
          {/* Header with Gradient and Unique Name */}
          <div style={{
            background: 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%)',
            color: '#fff',
            padding: window.innerWidth < 600 ? '18px 12px' : '28px 36px',
            fontWeight: 800,
            fontSize: window.innerWidth < 600 ? 20 : 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            letterSpacing: 1.2,
            boxShadow: '0 2px 16px rgba(99,102,241,0.10)',
          }}>
            <span style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <span role="img" aria-label="Learning Chatbot" style={{fontSize: window.innerWidth < 600 ? 24 : 36}}>🤖</span>
              Learning Chatbot
            </span>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: window.innerWidth < 600 ? 24 : 36, cursor: 'pointer', fontWeight: 400, transition: 'color 0.2s' }}>&times;</button>
          </div>
          {/* Chat Area with Glassmorphism and Gradient Bubbles */}
          <div style={{ flex: 1, padding: window.innerWidth < 600 ? 12 : 36, overflowY: 'auto', background: 'linear-gradient(135deg, #f1f5ff 0%, #e0e7ff 100%)', display: 'flex', flexDirection: 'column', gap: window.innerWidth < 600 ? 10 : 22 }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', margin: window.innerWidth < 600 ? '6px 0' : '12px 0', opacity: 0, animation: `fadeIn 0.5s ${0.1 * idx}s forwards` }}>
                <span style={{
                  display: 'inline-block',
                  background: msg.sender === 'user' ? 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%)' : 'rgba(255,255,255,0.85)',
                  color: msg.sender === 'user' ? '#fff' : '#222',
                  borderRadius: 22,
                  padding: window.innerWidth < 600 ? '10px 14px' : '16px 26px',
                  maxWidth: '90vw',
                  wordBreak: 'break-word',
                  boxShadow: msg.sender === 'user' ? '0 2px 12px rgba(99,102,241,0.12)' : '0 2px 12px rgba(160,160,200,0.10)',
                  fontSize: window.innerWidth < 600 ? 15 : 19,
                  backdropFilter: 'blur(2px)',
                  border: msg.sender === 'user' ? '1.5px solid #a5b4fc' : '1.5px solid #e0e7ff',
                  transition: 'background 0.2s',
                  animation: 'bubblePop 0.4s',
                }}>{msg.text}</span>
                {msg.files && msg.files.length > 0 && (
                  <div style={{ fontSize: window.innerWidth < 600 ? 11 : 14, color: '#555', marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    <b>Files:</b> {msg.files.map((f, i) => (
                      <span key={i} style={{ background: '#e0e7ff', borderRadius: 8, padding: '2px 8px', marginLeft: 4 }}>{f}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && <div style={{ textAlign: 'center', color: '#888', fontSize: window.innerWidth < 600 ? 15 : 20, opacity: 0.7, fontStyle: 'italic', letterSpacing: 1, animation: 'fadeIn 0.5s' }}>Learning Chatbot is typing...</div>}
          </div>
          {/* Input Area */}
          <div style={{ padding: window.innerWidth < 600 ? 10 : 28, borderTop: '1.5px solid #e0e7ff', background: 'rgba(255,255,255,0.98)', display: 'flex', gap: window.innerWidth < 600 ? 6 : 16, alignItems: 'center', flexDirection: window.innerWidth < 600 ? 'column' : 'row' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask me anything..."
              style={{ flex: 1, borderRadius: 14, border: '1.5px solid #a5b4fc', padding: window.innerWidth < 600 ? '10px 12px' : '18px 22px', fontSize: window.innerWidth < 600 ? 15 : 20, background: 'rgba(245,245,255,0.92)', outline: 'none', boxShadow: '0 1px 6px rgba(160,160,200,0.08)', color: '#333', width: window.innerWidth < 600 ? '100%' : undefined, marginBottom: window.innerWidth < 600 ? 6 : 0, transition: 'box-shadow 0.2s', animation: 'inputPop 0.3s' }}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              disabled={loading}
            />
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                borderRadius: 14,
                border: '1.5px solid #a5b4fc',
                background: 'linear-gradient(135deg, #e0e7ff 0%, #a5b4fc 100%)',
                padding: window.innerWidth < 600 ? '0 10px' : '0 20px',
                fontSize: window.innerWidth < 600 ? 18 : 28,
                color: '#6366f1',
                cursor: 'pointer',
                fontWeight: 700,
                boxShadow: '0 1px 6px rgba(160,160,200,0.08)',
                transition: 'background 0.2s, color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: window.innerWidth < 600 ? 36 : 56,
              }}
              disabled={loading}
              title="Attach files"
            >📎</button>
            <button
              onClick={handleSend}
              style={{
                borderRadius: 14,
                border: 'none',
                background: 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%)',
                color: '#fff',
                padding: window.innerWidth < 600 ? '0 18px' : '0 44px',
                fontWeight: 900,
                fontSize: window.innerWidth < 600 ? 16 : 24,
                boxShadow: '0 2px 12px rgba(99,102,241,0.12)',
                cursor: 'pointer',
                height: window.innerWidth < 600 ? 36 : 56,
                transition: 'background 0.2s, color 0.2s',
                letterSpacing: 1.1,
              }}
              disabled={loading}
            >Send</button>
          </div>
          {files.length > 0 && (
            <div style={{ margin: window.innerWidth < 600 ? '0 0 8px 0' : '0 0 16px 0', fontSize: window.innerWidth < 600 ? 12 : 15, color: '#555', paddingLeft: window.innerWidth < 600 ? 12 : 36, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              <b>Files:</b> {files.map((f, i) => (
                <span key={i} style={{ background: '#e0e7ff', borderRadius: 8, padding: '2px 8px', marginLeft: 4 }}>{f.name}</span>
              ))}
            </div>
          )}
          {/* Animations */}
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(16px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes bubblePop {
              0% { transform: scale(0.92); }
              100% { transform: scale(1); }
            }
            @keyframes inputPop {
              0% { box-shadow: 0 0 0 rgba(99,102,241,0.00); }
              100% { box-shadow: 0 2px 12px rgba(99,102,241,0.10); }
            }
          `}</style>
        </div>
      )}
    </>
  );
};

export default AIChatbot; 