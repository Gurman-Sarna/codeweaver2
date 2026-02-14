import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiCode, FiEye, FiRotateCcw, FiAlertCircle, FiCheck } from 'react-icons/fi';
import LivePreview from './components/LivePreview';
import './App.css';

// API Base URL - uses environment variable or defaults to relative path
const API_BASE = import.meta.env.VITE_API_URL;

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => 'session_' + Date.now());
  const [versions, setVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [showHome, setShowHome] = useState(true);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Load version history on mount
  useEffect(() => {
    loadVersionHistory();
  }, []);

  const loadVersionHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/history/${sessionId}`);
      if (!response.ok) {
        throw new Error(`Failed to load history: ${response.status}`);
      }
      const data = await response.json();
      setVersions(data.versions || []);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setShowHome(false);

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Call AI agent API
      const response = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIntent: userMessage,
          existingCode: generatedCode || null,
          sessionId
        })
      });

      // Check if response is ok before parsing
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // Response is not valid JSON
        const text = await response.text();
        throw new Error(`Invalid response from server: ${text || 'Empty response'}`);
      }

      if (data.success) {
        // Add AI response to chat
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.explanation,
          plan: data.plan,
          validation: data.validation,
          version: data.version
        }]);

        // Update code
        setGeneratedCode(data.code);
        setCurrentVersion(data.version);

        // Reload version history
        await loadVersionHistory();
      } else {
        setMessages(prev => [...prev, {
          role: 'error',
          content: `Error: ${data.error || 'Unknown error occurred'}`
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'error',
        content: `Failed to generate UI: ${error.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeEdit = (newCode) => {
    setGeneratedCode(newCode);
  };

  const handleRegenerate = async () => {
    if (messages.length === 0) return;
    
    // Find the last user message
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMessage) return;

    setInputValue(lastUserMessage.content);
    // User can then modify and send
  };

  const handleRollback = async (version) => {
    try {
      const response = await fetch(`${API_BASE}/version/${sessionId}/${version}`);
      if (!response.ok) {
        throw new Error(`Failed to rollback: ${response.status}`);
      }
      const data = await response.json();
      
      setGeneratedCode(data.code);
      setCurrentVersion(version);
      
      setMessages(prev => [...prev, {
        role: 'system',
        content: `Rolled back to version ${version}`
      }]);
    } catch (error) {
      console.error('Error rolling back:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">🧵</span>
          <h1>CodeWeaver</h1>
        </div>
        <div className="header-info">
          <span className="version-badge">v{currentVersion || '-'}</span>
          <span className="session-id">Session: {sessionId.slice(-8)}</span>
        </div>
      </header>

      {/* Main Layout */}
      <div className="app-layout">
        {/* Left Panel - Chat */}
        <div className="panel chat-panel">
          <div className="panel-header">
            <FiSend /> Chat
          </div>
          
          <div className="chat-messages">
            {showHome && (
              <div className="home-screen">
                <div className="welcome-card">
                  <h2>🎨 Welcome to CodeWeaver</h2>
                  <p className="tagline">AI-Powered Deterministic UI Generator</p>
                  
                  <div className="features">
                    <h3>How it works:</h3>
                    <ol>
                      <li><strong>Describe</strong> your UI in plain English</li>
                      <li><strong>See</strong> it generated instantly with live preview</li>
                      <li><strong>Iterate</strong> by asking for modifications</li>
                      <li><strong>Rollback</strong> to any previous version</li>
                    </ol>
                  </div>

                  <div className="component-library">
                    <h3>Fixed Component Library:</h3>
                    <div className="components-grid">
                      <span className="component-tag">Button</span>
                      <span className="component-tag">Card</span>
                      <span className="component-tag">Input</span>
                      <span className="component-tag">Table</span>
                      <span className="component-tag">Modal</span>
                      <span className="component-tag">Sidebar</span>
                      <span className="component-tag">Navbar</span>
                      <span className="component-tag">Chart</span>
                    </div>
                  </div>

                  <div className="examples">
                    <h3>Try these examples:</h3>
                    <ul>
                      <li>"Create a login form with email and password"</li>
                      <li>"Build a dashboard with a navbar and 3 cards showing stats"</li>
                      <li>"Make a user table with name, email, and role columns"</li>
                      <li>"Add a modal with a settings form"</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`message message-${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'user' ? '👤' : msg.role === 'error' ? '⚠️' : msg.role === 'system' ? 'ℹ️' : '🤖'}
                </div>
                <div className="message-content">
                  <div className="message-text">{msg.content}</div>
                  
                  {msg.validation && (
                    <div className="validation-badge">
                      {msg.validation.valid ? (
                        <span className="valid"><FiCheck /> Valid components</span>
                      ) : (
                        <span className="invalid"><FiAlertCircle /> Invalid: {msg.validation.invalidComponents.join(', ')}</span>
                      )}
                    </div>
                  )}
                  
                  {msg.plan && (
                    <details className="plan-details">
                      <summary>View Plan</summary>
                      <pre>{JSON.stringify(msg.plan, null, 2)}</pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message message-assistant">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="loading">
                    <div className="loading-dots">
                      <span></span><span></span><span></span>
                    </div>
                    <span>Generating UI...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            <textarea
              className="chat-input"
              placeholder="Describe your UI... (e.g., 'Create a dashboard with stats cards')"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={3}
            />
            <div className="input-actions">
              <button 
                className="btn-icon" 
                onClick={handleRegenerate}
                disabled={messages.length === 0}
                title="Regenerate"
              >
                <FiRotateCcw />
              </button>
              <button 
                className="btn-send" 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
              >
                <FiSend /> Send
              </button>
            </div>
          </div>
        </div>

        {/* Middle Panel - Code Editor */}
        <div className="panel code-panel">
          <div className="panel-header">
            <FiCode /> Generated Code
            {versions.length > 0 && (
              <div className="version-selector">
                <label>Version:</label>
                <select 
                  value={currentVersion || ''} 
                  onChange={(e) => handleRollback(parseInt(e.target.value))}
                >
                  {versions.map(v => (
                    <option key={v.version} value={v.version}>
                      v{v.version} - {v.userIntent.slice(0, 30)}...
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <textarea
            className="code-editor"
            value={generatedCode}
            onChange={(e) => handleCodeEdit(e.target.value)}
            placeholder="// Generated React code will appear here...\n// You can edit it manually!"
            spellCheck={false}
          />
        </div>

        {/* Right Panel - Live Preview */}
        <div className="panel preview-panel">
          <div className="panel-header">
            <FiEye /> Live Preview
          </div>
          
          <div className="preview-container">
            <LivePreview code={generatedCode} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
