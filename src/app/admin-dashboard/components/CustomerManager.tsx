"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function CustomerManager({ customers, fetchData, openUserDetails }: any) {
  const [searchQuery, setSearchQuery] = useState('');

  // Delete Customer Logic (with protection for unregistered/temporary customers)
  const deleteCustomer = async (id: any, name: string) => {
    if (String(id).startsWith('ord_cust_')) {
      return alert("Unregistered (Guest) customer delete nahi ho sakta.");
    }
    if (window.confirm(`Kya aap sach mein customer '${name}' ko delete karna chahte hain?`)) {
      try {
        const { error } = await supabase.from('customers').delete().eq('id', id);
        if (error) throw error;
        alert("✅ Customer Deleted Successfully!");
        fetchData();
      } catch (error: any) {
        alert("Error deleting customer: " + error.message);
      }
    }
  };

  // 🔥 Advanced Search Filtering (Name, Phone, State, District, Block, UPI)
  const filteredCustomers = customers.filter((c: any) => {
    const q = searchQuery.toLowerCase();
    const custName = (c.name || '').toLowerCase(); 
    const phoneMatch = (c.phone || '').includes(q);
    const stateMatch = (c.state || '').toLowerCase().includes(q);
    const districtMatch = (c.district || '').toLowerCase().includes(q);
    const blockMatch = (c.block || '').toLowerCase().includes(q);
    const upiMatch = (c.upi_id || '').toLowerCase().includes(q);

    return custName.includes(q) || phoneMatch || stateMatch || districtMatch || blockMatch || upiMatch;
  });

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ color: '#f59e0b', margin: 0, fontSize: '24px' }}>👥 Registered Customers & Complete Control</h2>
          <p style={{ color: '#94a3b8', margin: '5px 0 0 0', fontSize: '14px' }}>
            Total Registered Customers: <strong style={{ color: '#38bdf8', fontSize: '16px' }}>{customers.length}</strong>
          </p>
        </div>
      </div>

      {/* Advanced Search Bar */}
      <div style={{ marginBottom: '25px' }}>
        <input 
          type="text" 
          placeholder="🔍 Search by Name, Phone, UPI ID or Location..." 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)} 
          style={{ 
            width: '100%', maxWidth: '450px', padding: '14px 18px', 
            borderRadius: '12px', border: '1px solid #334155', 
            background: '#1e293b', color: 'white', outline: 'none', 
            boxSizing: 'border-box', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
          onBlur={(e) => e.target.style.borderColor = '#334155'}
        />
      </div>

      {/* Customers Table */}
      <div style={{ overflowX: 'auto', background: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', color: 'white' }}>
          <thead>
            <tr style={{ background: '#1e293b', color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              <th style={{ padding: '16px 20px', fontWeight: '600' }}>Customer Profile</th>
              <th style={{ padding: '16px 20px', fontWeight: '600' }}>Location Details</th>
              <th style={{ padding: '16px 20px', fontWeight: '600' }}>UPI & Delivery</th>
              <th style={{ padding: '16px 20px', fontWeight: '600' }}>Wallet (Balance)</th>
              <th style={{ padding: '16px 20px', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((c: any) => {
              // Ensure name fallback and initial extraction
              const custName = c.name?.trim() ? c.name : 'Unknown User';
              const initial = custName.charAt(0).toUpperCase();

              return (
                <tr key={c.id} style={{ borderBottom: '1px solid #1e293b', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                  
                  {/* Profile Picture, Name & Phone Combined */}
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      {/* Name Initial Avatar */}
                      <div style={{ 
                        width: '45px', height: '45px', borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #38bdf8, #3b82f6)', 
                        display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
                        border: '2px solid #1e293b', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                      }}>
                        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
                          {initial}
                        </span>
                      </div>
                      
                      {/* Name & Phone */}
                      <div>
                        <strong style={{ color: '#f8fafc', fontSize: '15px', display: 'block', marginBottom: '3px' }}>
                          {custName}
                        </strong>
                        <span style={{ color: '#38bdf8', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          📞 {c.phone || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* State, District, Block, Address */}
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ color: '#ec4899', fontSize: '12px', background: 'rgba(236,72,153,0.1)', padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold', display: 'inline-block', marginBottom: '6px' }}>
                      {c.district ? `${c.district}, ${c.state}` : (c.state || 'Location not set')}
                    </span><br/>
                    <span style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '2px' }}>
                      Block: <strong style={{color: '#cbd5e1'}}>{c.block || 'N/A'}</strong>
                    </span>
                    <span style={{ color: '#64748b', fontSize: '11px', display: 'block', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={c.address}>
                      {c.address || ''}
                    </span>
                  </td>

                  {/* UPI ID & Free Delivery Status */}
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>UPI ID:</span><br/>
                      <span style={{ color: c.upi_id ? '#e2e8f0' : '#64748b', fontSize: '13px', fontFamily: 'monospace' }}>
                        {c.upi_id || 'Not Added'}
                      </span>
                    </div>
                    <div>
                      {c.has_free_delivery ? (
                        <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>🚚 Free Delivery: YES</span>
                      ) : (
                        <span style={{ background: 'rgba(100, 116, 139, 0.1)', color: '#94a3b8', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>🚚 Free Delivery: NO</span>
                      )}
                    </div>
                  </td>

                  {/* Wallet Balance */}
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '8px 12px', borderRadius: '8px', display: 'inline-block' }}>
                      <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '18px' }}>
                        ₹{c.balance || 0}
                      </span>
                    </div>
                  </td>

                  {/* Actions / Control */}
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => openUserDetails(c, 'Customer')} style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid #38bdf8', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', transition: 'all 0.2s' }}>
                        💳 Manage Wallet
                      </button>
                      <button onClick={() => deleteCustomer(c.id, custName)} title="Delete Customer" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}>
                        🗑️
                      </button>
                    </div>
                  </td>

                </tr>
              );
            })}
            
            {/* Empty State */}
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '15px' }}>
                  No customers found matching your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}