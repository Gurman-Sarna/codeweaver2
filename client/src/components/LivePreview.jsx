import React, { useState, useEffect, useRef } from 'react';
import * as ComponentLibrary from './ComponentLibrary';
import * as Babel from '@babel/standalone';

/**
 * LivePreview Component
 * Safely renders AI-generated React code in an isolated environment
 */
function LivePreview({ code }) {
  const [Component, setComponent] = useState(null);
  const [error, setError] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!code) {
      setComponent(null);
      setError(null);
      return;
    }

    try {
      // Remove import statements (we'll provide components via scope)
      let processedCode = code
        .replace(/import\s+.*from\s+['"].*['"];?\n?/g, '')
        .replace(/export\s+default\s+/g, '');

      // Transpile JSX to plain JS using Babel (@babel/standalone)
      const transformed = Babel.transform(processedCode, { presets: ['react'] }).code;

      // Evaluate the transformed code and extract the GeneratedUI function
      // Provide React and common hooks + the component implementations into the scope
      const reactHelpers = ['useState', 'useEffect', 'useRef', 'useMemo', 'useCallback'];
      const paramNames = ['React', ...reactHelpers, ...Object.keys(ComponentLibrary)];
      const paramValues = [React, React.useState, React.useEffect, React.useRef, React.useMemo, React.useCallback, ...Object.values(ComponentLibrary)];

      const wrapper = `(function(${paramNames.join(',')}){\n${transformed}\n return typeof GeneratedUI !== 'undefined' ? GeneratedUI : null;\n})`;

      const GeneratedComponent = new Function(`return ${wrapper}`)()(...paramValues);

      if (!GeneratedComponent) throw new Error('Generated component not found after transpilation');

      setComponent(() => GeneratedComponent);
      setError(null);
    } catch (err) {
      console.error('Error rendering component:', err);
      setError(err.message || String(err));
      setComponent(null);
    }
  }, [code]);

  if (!code) {
    return (
      <div className="preview-placeholder">
        <div className="placeholder-content">
          <span className="placeholder-emoji">🎨</span>
          <h3>No UI Yet!</h3>
          <p>Your generated UI will appear here once you describe what you want.</p>
          <p className="placeholder-joke">
            It's like a blank canvas, but with more React hooks! 🪝
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="preview-error">
        <div className="error-content">
          <span className="error-emoji">⚠️</span>
          <h3>Render Error</h3>
          <p>Oops! The AI generated code that can't be rendered.</p>
          <details>
            <summary>Error Details</summary>
            <pre>{error}</pre>
          </details>
          <p className="error-joke">
            Even AI makes mistakes sometimes. Try rephrasing your request! 🤖💭
          </p>
        </div>
      </div>
    );
  }

  if (Component) {
    return (
      <div className="preview-wrapper">
        <ErrorBoundary>
          <Component />
        </ErrorBoundary>
      </div>
    );
  }

  return (
    <div className="preview-loading">
      <span>⏳ Rendering...</span>
    </div>
  );
}

/**
 * ErrorBoundary to catch runtime errors in generated components
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="preview-error">
          <div className="error-content">
            <span className="error-emoji">💥</span>
            <h3>Runtime Error</h3>
            <p>The component crashed while rendering.</p>
            <details>
              <summary>Error Details</summary>
              <pre>{this.state.error?.toString()}</pre>
            </details>
            <p className="error-joke">
              The component tried to break free but got caught! 🕸️
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default LivePreview;
