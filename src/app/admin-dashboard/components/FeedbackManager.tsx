"use client";
import React from 'react';

export default function FeedbackManager({ feedbacks }: any) {
  return (
    <div className="fade-in">
      <h2 style={{ color: '#facc15', marginTop: 0 }}>⭐ Customer Feedback & Ratings</h2>
      <p style={{ color: '#94a3b8', marginBottom: '20px' }}>Customers jo service rate karte aur review dete hain, unki list yahan hai.</p>
      
      <div style={{ overflowX: 'auto', background: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', color: 'white' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '15px' }}>Date</th>
              <th style={{ padding: '15px' }}>Customer Name</th>
              <th style={{ padding: '15px' }}>Rating</th>
              <th style={{ padding: '15px' }}>Comments / Issues</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map((f: any) => {
              const validRating = Math.max(0, Math.min(5, Number(f.rating) || 0));
              return (
                <tr key={f.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '15px', color: '#94a3b8', fontSize: '13px' }}>{new Date(f.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>{f.customer_name || 'Customer'}</td>
                  <td style={{ padding: '15px', color: '#facc15', fontSize: '18px', letterSpacing: '2px' }}>{'★'.repeat(validRating)}{'☆'.repeat(5 - validRating)}</td>
                  <td style={{ padding: '15px', color: '#cbd5e1', fontStyle: 'italic' }}>{f.comment || 'No comment provided'}</td>
                </tr>
              );
            })}
            {feedbacks.length === 0 && (
              <tr><td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No feedback found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}