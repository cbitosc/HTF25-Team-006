import React from 'react';

export default function AuthLayout({ children }) {
  return (
    <div className="auth-root">
      <div className="auth-container">
        <div className="auth-card-wrapper">{children}</div>
      </div>
    </div>
  );
}
