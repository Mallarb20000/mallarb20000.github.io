'use client'

import React from 'react';

export default function SimplePage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>IELTS Writing Interface</h1>
      <p>This is working! We have successfully loaded the main page.</p>
      
      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
        <div style={{ flex: 1, border: '1px solid #ccc', padding: '1rem' }}>
          <h2>Writing Area</h2>
          <textarea 
            style={{ width: '100%', height: '300px', padding: '0.5rem' }}
            placeholder="Start writing your IELTS essay here..."
          />
        </div>
        
        <div style={{ width: '300px', border: '1px solid #ccc', padding: '1rem' }}>
          <h2>Planning Notes</h2>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Essay Type:</label>
            <input type="text" style={{ width: '100%', padding: '0.5rem' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Hook Sentence:</label>
            <textarea style={{ width: '100%', height: '60px', padding: '0.5rem' }} />
          </div>
          <button style={{ 
            padding: '0.75rem 1rem', 
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            Chat with AI Coach
          </button>
        </div>
      </div>
    </div>
  );
}