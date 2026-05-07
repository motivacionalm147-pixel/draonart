import React, { Component, ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('DragonArt Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
          color: '#fff',
          padding: '20px',
          fontFamily: 'sans-serif',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '28px', marginBottom: '16px', color: '#ff4444', fontWeight: '900' }}>
            OPS! ALGO DEU ERRADO
          </h1>
          <div style={{ background: '#222', padding: '15px', borderRadius: '12px', marginBottom: '20px', width: '100%', maxWidth: '500px' }}>
            <p style={{ fontSize: '18px', color: '#fff', margin: '0', fontWeight: 'bold' }}>
              {this.state.error?.message || 'Erro desconhecido'}
            </p>
          </div>
          <button
             onClick={() => {
               navigator.clipboard.writeText(this.state.error?.stack || '');
               alert('Erro copiado!');
             }}
             style={{
               marginBottom: '10px',
               padding: '8px 16px',
               background: '#333',
               color: '#fff',
               border: '1px solid #444',
               borderRadius: '8px'
             }}
          >
            Copiar Erro para o Zap
          </button>
          <pre style={{ fontSize: '10px', color: '#666', maxWidth: '90vw', overflow: 'auto', marginTop: '16px', textAlign: 'left', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '24px',
              padding: '16px 40px',
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)',
              width: '100%',
              maxWidth: '300px'
            }}
          >
            Tentar Novamente
          </button>
          <button
            onClick={() => {
              if (confirm('Isso apagará todos os seus desenhos salvos para recuperar o app. Tem certeza?')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            style={{
              marginTop: '12px',
              padding: '12px 30px',
              background: 'transparent',
              color: '#666',
              border: '1px solid #333',
              borderRadius: '15px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Limpar Tudo e Resetar App
          </button>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
