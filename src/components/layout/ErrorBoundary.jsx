import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '100px 24px',
          textAlign: 'center',
          color: 'var(--text-primary)',
          background: 'var(--card-bg)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h1 style={{ marginBottom: '1.5rem', fontSize: '2.5rem' }}>Oops! 出现了一点小意外</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: '500px' }}>
            很抱歉，当前页面加载出错。您可以尝试刷新页面，或点击下方按钮返回主页。
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="btn"
            style={{ padding: '12px 40px' }}
          >
            返回主页
          </button>
          
          {process.env.NODE_ENV === 'development' && (
            <pre style={{ 
              marginTop: '40px', 
              padding: '20px', 
              background: '#f4433611', 
              borderRadius: '8px', 
              fontSize: '0.8rem',
              color: '#f44336',
              textAlign: 'left',
              maxWidth: '80vw',
              overflow: 'auto'
            }}>
              {this.state.error && this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
