import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** 'public' shows a friendly message; 'admin' also shows the technical error. */
  variant?: 'public' | 'admin';
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const isAdmin = this.props.variant === 'admin';

    return (
      <div
        role="alert"
        style={{
          minHeight: isAdmin ? '50vh' : '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '2rem',
          textAlign: 'center',
          background: '#F7F5EE',
          color: '#3B2A20',
          fontFamily: 'sans-serif',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>
          {isAdmin ? 'Ocurrió un error en el panel' : 'Algo salió mal'}
        </h1>
        <p style={{ margin: 0, maxWidth: '32rem' }}>
          {isAdmin
            ? 'Se produjo un error al mostrar esta vista.'
            : 'No pudimos mostrar la página. Probá recargarla en unos instantes.'}
        </p>
        {isAdmin && (
          <pre
            style={{
              maxWidth: '100%',
              overflow: 'auto',
              padding: '1rem',
              background: '#fff',
              border: '1px solid #e5e0d5',
              borderRadius: '0.5rem',
              fontSize: '0.8rem',
              textAlign: 'left',
            }}
          >
            {error.message}
            {error.stack ? `\n\n${error.stack}` : ''}
          </pre>
        )}
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '0.75rem',
            background: '#6B2D3E',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          Recargar página
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
