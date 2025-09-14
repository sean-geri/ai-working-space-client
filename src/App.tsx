import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [slideNumber, setSlideNumber] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [presentationHtml, setPresentationHtml] = useState<string | null>(null);
  const [showPresentation, setShowPresentation] = useState(false);
  const [activeTab, setActiveTab] = useState<'presentation' | 'chat'>('presentation');
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [chatPrompt, setChatPrompt] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const response = await fetch('http://51.17.251.13:3000/chat-presentation/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': 'jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxODQiLCJpYXQiOjE3NDQ1NDAwOTIsImV4cCI6MTc0NDYyNjQ5Mn0._z3l95hthqK3qdbg9OG2KudQjHrrX52vfGzOgShO-p4; jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxODQiLCJpYXQiOjE3NDQ1NDAwOTIsImV4cCI6MTc0NDYyNjQ5Mn0._z3l95hthqK3qdbg9OG2KudQjHrrX52vfGzOgShO-p4'
        },
        body: JSON.stringify({
          prompt: prompt,
          slideNumber: slideNumber,
          sessionId: "asdasd"
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResponse(data);

      // Extract HTML from the response
      if (data.output && data.output.length > 0 && data.output[0].output) {
        setPresentationHtml(data.output[0].output);
        setShowPresentation(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPresentation = () => {
    if (!presentationHtml) return;

    const blob = new Blob([presentationHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `presentation-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleChatSubmit = async () => {
    if (!chatPrompt.trim()) return;

    const userMessage = chatPrompt.trim();
    setChatPrompt('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsChatLoading(true);

    try {
      const response = await fetch('http://localhost:3010/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': 'jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxODQiLCJpYXQiOjE3NDQ1NDAwOTIsImV4cCI6MTc0NDYyNjQ5Mn0._z3l95hthqK3qdbg9OG2KudQjHrrX52vfGzOgShO-p4'
        },
        body: JSON.stringify({
          prompt: userMessage,
          sessionId: "asdasdasd"
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data && data.data.output) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.data.output }]);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
  };

  // Load HTML content into iframe
  useEffect(() => {
    if (presentationHtml && showPresentation && iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(presentationHtml);
        doc.close();
      }
    }
  }, [presentationHtml, showPresentation]);

  return (
    <div className="App">
      {/* Loading Dialog */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.3)',
            textAlign: 'center',
            maxWidth: '400px',
            width: '90%',
            animation: 'fadeInScale 0.3s ease-out'
          }}>
            {/* Animated hourglass */}
            <div style={{
              fontSize: '64px',
              marginBottom: '20px',
              animation: 'bounce 2s infinite'
            }}>
              ⏳
            </div>

            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 12px 0',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              Creating Your Presentation
            </h2>

            <p style={{
              fontSize: '18px',
              color: '#667eea',
              fontWeight: '600',
              margin: '0 0 24px 0',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              Good things take time ✨
            </p>

            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: 0,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              Our AI is crafting something amazing for you...
            </p>

            {/* Progress dots */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '24px'
            }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#667eea',
                    borderRadius: '50%',
                    animation: `pulse 1.5s infinite ${i * 0.2}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {presentationHtml && showPresentation ? (
        // Full-screen presentation view
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'white',
          zIndex: 1000
        }}>
          {/* Control buttons */}
          <div style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            display: 'flex',
            gap: '10px',
            zIndex: 1001
          }}>
            <button
              onClick={downloadPresentation}
              style={{
                padding: '12px 18px',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#059669';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#10b981';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              📥 Download
            </button>
            <button
              onClick={() => setShowPresentation(false)}
              style={{
                padding: '12px 18px',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#ef4444';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              ✕ Close
            </button>
          </div>
          <iframe
            ref={iframeRef}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              margin: 0,
              padding: 0
            }}
            title="Generated Presentation"
          />
        </div>
      ) : (
        // Modern form view
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '0',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
            maxWidth: activeTab === 'chat' ? '800px' : '500px',
            width: '100%',
            backdropFilter: 'blur(10px)',
            overflow: 'hidden'
          }}>
            {/* Tab Navigation */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <button
                onClick={() => setActiveTab('presentation')}
                style={{
                  flex: 1,
                  padding: '16px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  backgroundColor: activeTab === 'presentation' ? '#667eea' : 'transparent',
                  color: activeTab === 'presentation' ? 'white' : '#6b7280',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderTopLeftRadius: '20px'
                }}
              >
                🎯 Presentation Generator
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                style={{
                  flex: 1,
                  padding: '16px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  backgroundColor: activeTab === 'chat' ? '#667eea' : 'transparent',
                  color: activeTab === 'chat' ? 'white' : '#6b7280',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderTopRightRadius: '20px'
                }}
              >
                💬 AI Chat
              </button>
            </div>

            {/* Tab Content */}
            <div style={{ padding: '40px' }}>
              {activeTab === 'presentation' ? (
                <>
                  {/* Header */}
                  <div style={{
                    textAlign: 'center',
                    marginBottom: '32px'
                  }}>
                    <div style={{
                      fontSize: '48px',
                      marginBottom: '12px'
                    }}>🎯</div>
                    <h1 style={{
                      fontSize: '28px',
                      fontWeight: '700',
                      color: '#1f2937',
                      margin: '0 0 8px 0'
                    }}>
                      AI Presentation Generator
                    </h1>
                    <p style={{
                      fontSize: '16px',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      Create stunning presentations powered by AI
                    </p>
                  </div>

                  {/* Form */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px'
                  }}>
              <div>
                <label htmlFor="prompt" style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  What's your presentation about?
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Machine Learning fundamentals for beginners"
                  style={{
                    width: '100%',
                    height: '120px',
                    padding: '16px',
                    fontSize: '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    backgroundColor: '#f9fafb',
                    color: '#1f2937',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.backgroundColor = 'white';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.backgroundColor = '#f9fafb';
                  }}
                />
              </div>

              <div>
                <label htmlFor="slideNumber" style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Number of slides
                </label>
                <select
                  id="slideNumber"
                  value={slideNumber}
                  onChange={(e) => setSlideNumber(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    backgroundColor: '#f9fafb',
                    color: '#1f2937',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.backgroundColor = 'white';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.backgroundColor = '#f9fafb';
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map(num => (
                    <option key={num} value={num}>{num} slides</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading || !prompt.trim()}
                style={{
                  width: '100%',
                  padding: '18px',
                  fontSize: '16px',
                  fontWeight: '600',
                  backgroundColor: isLoading || !prompt.trim() ? '#9ca3af' : '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: isLoading || !prompt.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isLoading || !prompt.trim() ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)',
                  transform: 'translateY(0)',
                  outline: 'none'
                }}
                onMouseOver={(e) => {
                  if (!isLoading && prompt.trim()) {
                    e.currentTarget.style.backgroundColor = '#5a67d8';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.5)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isLoading && prompt.trim()) {
                    e.currentTarget.style.backgroundColor = '#667eea';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                  }
                }}
              >
                {isLoading ? 'Processing...' : '🚀 Generate Presentation'}
              </button>

              {error && (
                <div style={{
                  padding: '16px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#dc2626'
                }}>
                  <strong>Error:</strong> {error}
                </div>
              )}

              {presentationHtml && !showPresentation && (
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div>
                    <strong>Presentation Ready!</strong> Your presentation is generated and ready to view.
                  </div>
                  <button
                    onClick={() => setShowPresentation(true)}
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '600',
                      backgroundColor: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#5a67d8';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#667eea';
                    }}
                  >
                    📊 View Presentation
                  </button>
                </div>
              )}

              {response && !presentationHtml && (
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#166534',
                  maxHeight: '150px',
                  overflow: 'auto'
                }}>
                <strong>Success!</strong> Presentation generated successfully.
              </div>
            )}
                  </div>
                </>
              ) : (
                // Chat Interface
                <>
                  <div style={{
                    textAlign: 'center',
                    marginBottom: '32px'
                  }}>
                    <div style={{
                      fontSize: '48px',
                      marginBottom: '12px'
                    }}>💬</div>
                    <h1 style={{
                      fontSize: '28px',
                      fontWeight: '700',
                      color: '#1f2937',
                      margin: '0 0 8px 0'
                    }}>
                      AI Chat Assistant
                    </h1>
                    <p style={{
                      fontSize: '16px',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      Chat with our AI assistant - Ask anything!
                    </p>
                  </div>

                  {/* Chat Messages */}
                  <div style={{
                    height: '400px',
                    overflowY: 'auto',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '16px',
                    backgroundColor: '#f9fafb'
                  }}>
                    {chatMessages.length === 0 ? (
                      <div style={{
                        textAlign: 'center',
                        color: '#6b7280',
                        padding: '40px 20px',
                        fontSize: '16px'
                      }}>
                        👋 Start a conversation! Ask me anything.
                      </div>
                    ) : (
                      chatMessages.map((message, index) => (
                        <div
                          key={index}
                          style={{
                            marginBottom: '16px',
                            display: 'flex',
                            justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
                          }}
                        >
                          <div style={{
                            maxWidth: '80%',
                            padding: '12px 16px',
                            borderRadius: '16px',
                            backgroundColor: message.role === 'user' ? '#667eea' : 'white',
                            color: message.role === 'user' ? 'white' : '#1f2937',
                            border: message.role === 'assistant' ? '1px solid #e5e7eb' : 'none',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            fontSize: '15px',
                            lineHeight: '1.5'
                          }}>
                            {message.content}
                          </div>
                        </div>
                      ))
                    )}
                    
                    {isChatLoading && (
                      <div style={{
                        marginBottom: '16px',
                        display: 'flex',
                        justifyContent: 'flex-start'
                      }}>
                        <div style={{
                          maxWidth: '80%',
                          padding: '12px 16px',
                          borderRadius: '16px',
                          backgroundColor: 'white',
                          color: '#1f2937',
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                          fontSize: '15px',
                          lineHeight: '1.5',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <div style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid #e5e7eb',
                            borderTop: '2px solid #667eea',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }}></div>
                          AI is thinking...
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-end'
                  }}>
                    <textarea
                      value={chatPrompt}
                      onChange={(e) => setChatPrompt(e.target.value)}
                      onKeyPress={handleChatKeyPress}
                      placeholder="Type your message here... (Press Enter to send)"
                      style={{
                        flex: 1,
                        minHeight: '50px',
                        maxHeight: '120px',
                        padding: '12px 16px',
                        fontSize: '16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        backgroundColor: '#f9fafb',
                        color: '#1f2937',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.backgroundColor = 'white';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.backgroundColor = '#f9fafb';
                      }}
                    />
                    <button
                      onClick={handleChatSubmit}
                      disabled={isChatLoading || !chatPrompt.trim()}
                      style={{
                        padding: '14px 20px',
                        fontSize: '16px',
                        fontWeight: '600',
                        backgroundColor: isChatLoading || !chatPrompt.trim() ? '#9ca3af' : '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: isChatLoading || !chatPrompt.trim() ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isChatLoading || !chatPrompt.trim() ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseOver={(e) => {
                        if (!isChatLoading && chatPrompt.trim()) {
                          e.currentTarget.style.backgroundColor = '#5a67d8';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isChatLoading && chatPrompt.trim()) {
                          e.currentTarget.style.backgroundColor = '#667eea';
                        }
                      }}
                    >
                      {isChatLoading ? 'Sending...' : '📤 Send'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
