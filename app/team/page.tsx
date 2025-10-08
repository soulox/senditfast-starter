'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TeamMember {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  invited_at: string;
  accepted_at: string | null;
  last_active_at: string | null;
}

export default function TeamPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('member');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const userPlan = (session?.user as any)?.plan || 'FREE';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/team');
      return;
    }

    if (status === 'authenticated' && userPlan !== 'BUSINESS') {
      router.push('/pricing');
      return;
    }

    if (status === 'authenticated') {
      fetchTeamMembers();
    }
  }, [status, userPlan, router]);

  const fetchTeamMembers = async () => {
    try {
      const res = await fetch('/api/team');
      const data = await res.json();
      if (data.success) {
        setMembers(data.members);
      }
    } catch (err) {
      console.error('Failed to fetch team members:', err);
    } finally {
      setLoading(false);
    }
  };

  const inviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, role })
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(`Invitation sent to ${email}!`);
        setEmail('');
        setName('');
        setRole('member');
        fetchTeamMembers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to send invitation');
      }
    } catch (err) {
      setError('Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      const res = await fetch(`/api/team/${memberId}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('Team member removed');
        fetchTeamMembers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to remove member');
      }
    } catch (err) {
      setError('Failed to remove member');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ fontSize: 18, color: 'white', fontWeight: 500 }}>
          Loading...
        </div>
      </div>
    );
  }

  const maxMembers = 5; // Business plan limit
  const canInvite = members.length < maxMembers;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 32
        }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: 'white', margin: '0 0 8px 0' }}>
              👥 Team Management
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255, 255, 255, 0.85)', margin: 0 }}>
              {members.length} / {maxMembers} seats used
            </p>
          </div>
          <Link
            href="/dashboard"
            style={{
              padding: '12px 24px',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Messages */}
        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#dc2626',
            padding: 16,
            borderRadius: 8,
            marginBottom: 24,
            border: '1px solid #fecaca'
          }}>
            ❌ {error}
          </div>
        )}

        {success && (
          <div style={{
            background: '#d1fae5',
            color: '#065f46',
            padding: 16,
            borderRadius: 8,
            marginBottom: 24,
            border: '1px solid #6ee7b7'
          }}>
            ✅ {success}
          </div>
        )}

        {/* Invite Form */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: 20, fontWeight: 600 }}>
            ➕ Invite Team Member
          </h2>

          {!canInvite && (
            <div style={{
              background: '#fef3c7',
              padding: 12,
              borderRadius: 6,
              marginBottom: 16,
              fontSize: 14,
              color: '#92400e'
            }}>
              ⚠️ You've reached the maximum of {maxMembers} team members
            </div>
          )}

          <form onSubmit={inviteMember}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto', gap: 12 }}>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!canInvite || inviting}
                style={{
                  padding: 12,
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14
                }}
              />
              <input
                type="text"
                placeholder="Name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!canInvite || inviting}
                style={{
                  padding: 12,
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14
                }}
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={!canInvite || inviting}
                style={{
                  padding: 12,
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14
                }}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="submit"
                disabled={!canInvite || inviting}
                style={{
                  padding: '12px 24px',
                  background: !canInvite || inviting ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: !canInvite || inviting ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {inviting ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </form>
        </div>

        {/* Team Members List */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: 20, fontWeight: 600 }}>
            Team Members
          </h2>

          {members.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
              <p>No team members yet. Invite your first team member above!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {members.map((member) => (
                <div
                  key={member.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 16,
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    background: member.status === 'pending' ? '#fef3c7' : 'white'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 18,
                      fontWeight: 600
                    }}>
                      {member.email.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', marginBottom: 4 }}>
                        {member.name || member.email}
                      </div>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>
                        {member.email}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: 4,
                        background: member.role === 'admin' ? '#dbeafe' : '#f3f4f6',
                        color: member.role === 'admin' ? '#1e40af' : '#6b7280',
                        textTransform: 'uppercase'
                      }}>
                        {member.role}
                      </span>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: 4,
                        background: member.status === 'active' ? '#d1fae5' : member.status === 'pending' ? '#fef3c7' : '#fee2e2',
                        color: member.status === 'active' ? '#065f46' : member.status === 'pending' ? '#92400e' : '#dc2626',
                        textTransform: 'uppercase'
                      }}>
                        {member.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeMember(member.id)}
                    style={{
                      padding: '8px 16px',
                      background: 'white',
                      color: '#dc2626',
                      border: '1px solid #dc2626',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginLeft: 16
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
