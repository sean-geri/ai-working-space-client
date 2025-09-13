import React, { useState, useRef, useEffect } from 'react';
import logo from './logo.svg';
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
          <button
            onClick={() => setPresentationHtml(null)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              padding: '10px 15px',
              fontSize: '14px',
              fontWeight: 'bold',
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              zIndex: 1001,
              boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
            }}
          >
            ✕ Close
          </button>
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
        // Form view
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px', 
            maxWidth: '500px', 
            width: '100%',
            padding: '20px'
          }}>
            <h2>Generate Presentation</h2>
            
            <div>
              <label htmlFor="prompt" style={{ display: 'block', marginBottom: '8px', fontSize: '16px' }}>
                Enter your prompt:
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Generate presentation about Python for loops"
                style={{
                  width: '100%',
                  height: '100px',
                  padding: '12px',
                  fontSize: '16px',
                  border: '2px solid #61dafb',
                  borderRadius: '8px',
                  backgroundColor: '#282c34',
                  color: 'white',
                  resize: 'vertical'
                }}
              />
            </div>

            <div>
              <label htmlFor="slideNumber" style={{ display: 'block', marginBottom: '8px', fontSize: '16px' }}>
                Number of slides:
              </label>
              <select
                id="slideNumber"
                value={slideNumber}
                onChange={(e) => setSlideNumber(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: '2px solid #61dafb',
                  borderRadius: '8px',
                  backgroundColor: '#282c34',
                  color: 'white'
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading || !prompt.trim()}
              style={{
                padding: '15px 30px',
                fontSize: '18px',
                fontWeight: 'bold',
                backgroundColor: isLoading || !prompt.trim() ? '#666' : '#61dafb',
                color: '#282c34',
                border: 'none',
                borderRadius: '8px',
                cursor: isLoading || !prompt.trim() ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s'
              }}
            >
              {isLoading ? 'Generating...' : 'Generate Presentation'}
            </button>

            {error && (
              <div style={{
                padding: '12px',
                backgroundColor: '#ff6b6b',
                color: 'white',
                borderRadius: '8px',
                fontSize: '16px'
              }}>
                Error: {error}
              </div>
            )}

            {response && !presentationHtml && (
              <div style={{
                padding: '12px',
                backgroundColor: '#51cf66',
                color: '#282c34',
                borderRadius: '8px',
                fontSize: '16px',
                maxHeight: '200px',
                overflow: 'auto'
              }}>
                <strong>Success!</strong>
                <pre style={{ margin: '8px 0', fontSize: '14px' }}>
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </header>
      )}
    </div>
  );
}

export default App;
