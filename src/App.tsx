import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [slideNumber, setSlideNumber] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [presentationHtml, setPresentationHtml] = useState<string | null>(null);
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
      const response = await fetch('http://localhost:3007/chat/prompt', {
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

  // Load HTML content into iframe
  useEffect(() => {
    if (presentationHtml && iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(presentationHtml);
        doc.close();
      }
    }
  }, [presentationHtml]);

  return (
    <div className="App">
      {presentationHtml ? (
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
              onClick={() => setPresentationHtml(null)}
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
            padding: '40px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
            maxWidth: '500px',
            width: '100%',
            backdropFilter: 'blur(10px)'
          }}>
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
                {isLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></span>
                    Generating your presentation...
                  </span>
                ) : (
                  '🚀 Generate Presentation'
                )}
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
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
