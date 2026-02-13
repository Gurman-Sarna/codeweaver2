import React from 'react';
import './ComponentLibrary.css';

/**
 * FIXED COMPONENT LIBRARY
 * These components have FIXED styling and behavior.
 * The AI can only use these components - it cannot modify them or create new ones.
 */

export function Button({ variant = 'primary', size = 'medium', onClick, children, disabled }) {
  return (
    <button 
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function Card({ title, children, footer, className = '' }) {
  return (
    <div className={`card ${className}`}>
      {title && <div className="card-header">{title}</div>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

export function Input({ type = 'text', placeholder, value, onChange, label }) {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="input-field"
      />
    </div>
  );
}

export function Table({ headers, data, onRowClick }) {
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {headers.map((header, idx) => (
              <th key={idx}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr 
              key={rowIdx} 
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? 'clickable' : ''}
            >
              {headers.map((header, cellIdx) => (
                <td key={cellIdx}>{row[header]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function Sidebar({ children, isOpen, onToggle }) {
  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <button className="sidebar-toggle" onClick={onToggle}>
          {isOpen ? '◀' : '▶'}
        </button>
        <div className="sidebar-content">{children}</div>
      </div>
    </>
  );
}

export function Navbar({ title, links = [], actions }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">{title}</div>
      <div className="navbar-links">
        {links.map((link, idx) => (
          <a key={idx} href={link.href} className="navbar-link">
            {link.text}
          </a>
        ))}
      </div>
      {actions && <div className="navbar-actions">{actions}</div>}
    </nav>
  );
}

export function Chart({ type = 'bar', data, title }) {
  // Simple mock visualization
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="chart">
      {title && <h3 className="chart-title">{title}</h3>}
      <div className={`chart-${type}`}>
        {type === 'bar' && data.map((item, idx) => (
          <div key={idx} className="chart-bar-item">
            <div className="chart-bar-label">{item.label}</div>
            <div className="chart-bar-container">
              <div 
                className="chart-bar-fill"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              >
                <span className="chart-bar-value">{item.value}</span>
              </div>
            </div>
          </div>
        ))}
        
        {type === 'line' && (
          <div className="chart-line-container">
            <svg width="100%" height="200" viewBox="0 0 400 200">
              <polyline
                points={data.map((d, i) => 
                  `${(i / (data.length - 1)) * 400},${200 - (d.value / maxValue) * 180}`
                ).join(' ')}
                fill="none"
                stroke="#4f46e5"
                strokeWidth="2"
              />
              {data.map((d, i) => (
                <circle
                  key={i}
                  cx={(i / (data.length - 1)) * 400}
                  cy={200 - (d.value / maxValue) * 180}
                  r="4"
                  fill="#4f46e5"
                />
              ))}
            </svg>
            <div className="chart-labels">
              {data.map((d, i) => (
                <span key={i}>{d.label}</span>
              ))}
            </div>
          </div>
        )}
        
        {type === 'pie' && (
          <div className="chart-pie">
            🥧 Pie chart visualization (mock)
            {data.map((d, i) => (
              <div key={i} className="chart-pie-item">
                <span className="chart-pie-color" style={{backgroundColor: `hsl(${i * 60}, 70%, 60%)`}}></span>
                {d.label}: {d.value}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
