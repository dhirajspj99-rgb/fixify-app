'use client'; // Next.js mein client-side hook use karne ke liye yeh zaroori hai
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient'; // Path apne according check kar lein

// TypeScript interface (Data ka format define karna)
interface PendingUser {
  id: string;
  full_name: string;
  phone_number: string;
  requested_role: string;
  status: string;
}

export default function AdminApprovalDashboard() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, phone_number, requested_role, status')
      .eq('status', 'pending');

    if (error) {
      console.error('Error fetching data:', error.message);
    } else {
      setPendingUsers(data as PendingUser[]);
    }
    setLoading(false);
  };

  const handleApprove = async (userId: string, requestedRole: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        status: 'approved', 
        role: requestedRole 
      })
      .eq('id', userId);

    if (error) {
      alert('Approval fail ho gaya: ' + error.message);
    } else {
      alert('User successfully approved!');
      fetchPendingApprovals();
    }
  };

  const handleReject = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'rejected' })
      .eq('id', userId);

    if (error) {
      alert('Rejection fail ho gaya: ' + error.message);
    } else {
      alert('User request rejected.');
      fetchPendingApprovals();
    }
  };

  if (loading) return <p>Loading pending requests...</p>;

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', marginTop: '20px' }}>
      <h2>Pending Labour Approvals</h2>

      {pendingUsers.length === 0 ? (
        <p>Koi nayi request nahi hai.</p>
      ) : (
        <table border={1} cellPadding={10} style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th>Name</th>
              <th>Phone</th>
              <th>Requested Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.full_name}</td>
                <td>{user.phone_number || 'N/A'}</td>
                <td>{user.requested_role}</td>
                <td>
                  <button 
                    onClick={() => handleApprove(user.id, user.requested_role)}
                    style={{ backgroundColor: 'green', color: 'white', marginRight: '10px', padding: '5px 10px', cursor: 'pointer' }}
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleReject(user.id)}
                    style={{ backgroundColor: 'red', color: 'white', padding: '5px 10px', cursor: 'pointer' }}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}