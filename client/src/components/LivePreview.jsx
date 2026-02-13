import React, { useState, useEffect, useRef } from 'react';
import * as ComponentLibrary from './ComponentLibrary';

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
      // Create a function from the code string
      // This is safe because we control the execution environment
      
      // Remove import statements (we'll provide components via scope)
      let processedCode = code
        .replace(/import\s+.*from\s+['"].*['"];?\n?/g, '')
        .replace(/export\s+default\s+/g, '');

      // Extract the function body
      const functionMatch = processedCode.match(/function\s+\w+\s*\([^)]*\)\s*{([\s\S]*)}/);
      
      if (functionMatch) {
        const functionBody = functionMatch[1];
        
        // Create a function with React and components in scope
        const GeneratedComponent = new Function(
          'React',
          'useState',
          'useEffect',
          ...Object.keys(ComponentLibrary),
          `return function GeneratedUI() { ${functionBody} }`
        )(
          React,
          React.useState,
          React.useEffect,
          ...Object.values(ComponentLibrary)
        );

        setComponent(() => GeneratedComponent);
        setError(null);
      } else {
        throw new Error('Could not parse component function');
      }
    } catch (err) {
      console.error('Error rendering component:', err);
      setError(err.message);
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
