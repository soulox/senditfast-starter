'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  total_users: number;
  free_users: number;
  pro_users: number;
  business_users: number;
  new_users_30d: number;
  new_users_7d: number;
  active_users_30d: number;
  active_users_7d: number;
  total_storage_used: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
  role: string;
  created_at: string;
  last_login_at: string | null;
  total_transfers: number;
  total_size_transferred: number;
  storage_used_bytes: number;
}

export default function SuperAdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'analytics' | 'audit'>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setLoading(false);
      router.push('/auth/signin?callbackUrl=/superadmin');
      return;
    }
    
    if (status === 'authenticated') {
      fetchStats();
      fetchUsers();
    }
  }, [status, router, currentPage, selectedPlanFilter, searchTerm]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/superadmin/stats?ts=${Date.now()}` as any, { cache: 'no-store' } as any);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      } else if (response.status === 403) {
        setError('Access denied. Super admin privileges required.');
      } else {
        setError(data.error || 'Failed to fetch statistics');
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedPlanFilter && { plan: selectedPlanFilter }),
      });

      const response = await fetch(`/api/superadmin/users?${params.toString()}&ts=${Date.now()}` as any, { cache: 'no-store' } as any);
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.pagination.totalPages);
      } else if (response.status === 403) {
        setError('Access denied. Super admin privileges required.');
      } else {
        setError(data.error || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const updateUserPlan = async (userId: string, newPlan: string) => {
    if (!confirm(`Change user's plan to ${newPlan}?`)) return;

    try {
      const response = await fetch(`/api/superadmin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: newPlan }),
      });

      const data = await response.json();
      
      if (data.success) {
        fetchUsers();
        alert('User plan updated successfully!');
      } else {
        alert(data.error || 'Failed to update user');
      }
    } catch (err) {
      alert('Failed to update user');
    }
  };

  const formatBytes = (value: number | string | null | undefined) => {
    const bytes = typeof value === 'string' ? parseInt(value, 10) : (typeof value === 'number' ? value : 0);
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const normalized = bytes / Math.pow(k, i);
    return `${Math.round(normalized * 100) / 100} ${sizes[i] ?? 'B'}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚙️</div>
          <div>Loading Super Admin Panel...</div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
          <div>Redirecting to sign in...</div>
        </div>
      </div>
    );
  }

  if (error && error.includes('Access denied')) {
    return (
      <div style={{ maxWidth: 600, margin: '100px auto', textAlign: 'center', padding: 24 }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>🔒</div>
        <h1 style={{ fontSize: 32, marginBottom: 16 }}>Access Denied</h1>
        <p style={{ fontSize: 18, color: '#666', marginBottom: 32 }}>
          You don't have permission to access this page. Super admin privileges are required.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            padding: '12px 24px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
        color: 'white',
        padding: 32,
        borderRadius: 16,
        marginBottom: 32,
      }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
          ⚡ Super Admin Control Panel
        </h1>
        <p style={{ margin: 0, opacity: 0.9 }}>
          Manage users, plans, and monitor system usage
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 24,
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: 0,
      }}>
        {(['overview', 'users', 'analytics', 'audit'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 24px',
              background: activeTab === tab ? '#667eea' : 'transparent',
              color: activeTab === tab ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div>
          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 20,
            marginBottom: 32,
          }}>
            <StatCard
              title="Total Users"
              value={stats.total_users}
              icon="👥"
              color="#667eea"
              subtitle={`${stats.new_users_7d} new this week`}
            />
            <StatCard
              title="Free Users"
              value={stats.free_users}
              icon="🆓"
              color="#10b981"
              subtitle={`${Math.round((stats.free_users / stats.total_users) * 100)}% of total`}
            />
            <StatCard
              title="Pro Users"
              value={stats.pro_users}
              icon="⚡"
              color="#f59e0b"
              subtitle={`${Math.round((stats.pro_users / stats.total_users) * 100)}% of total`}
            />
            <StatCard
              title="Business Users"
              value={stats.business_users}
              icon="👑"
              color="#ef4444"
              subtitle={`${Math.round((stats.business_users / stats.total_users) * 100)}% of total`}
            />
            <StatCard
              title="Active (30d)"
              value={stats.active_users_30d}
              icon="📈"
              color="#8b5cf6"
              subtitle={`${Math.round((stats.active_users_30d / stats.total_users) * 100)}% active rate`}
            />
            <StatCard
              title="Storage Used"
              value={formatBytes(stats.total_storage_used)}
              icon="💾"
              color="#06b6d4"
              subtitle="Total across all users"
            />
          </div>

          {/* Change Password (visible only to superadmin) */}
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <h3 style={{ marginTop: 0 }}>Change Password</h3>
            <form onSubmit={async (e: any) => {
              e.preventDefault();
              const currentPassword = e.currentTarget.currentPassword.value;
              const newPassword = e.currentTarget.newPassword.value;
              if (!currentPassword || !newPassword) return;
              try {
                const res = await fetch('/api/superadmin/change-password', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ currentPassword, newPassword }),
                });
                const j = await res.json();
                if (!res.ok) {
                  alert(j.error || 'Failed to change password');
                } else {
                  (e.currentTarget as HTMLFormElement).reset();
                  alert('Password updated');
                }
              } catch (_) {
                alert('Failed to change password');
              }
            }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <input name="currentPassword" type="password" placeholder="Current password" style={{ padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: 8, minWidth: 220 }} />
                <input name="newPassword" type="password" placeholder="New password (min 8)" style={{ padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: 8, minWidth: 220 }} />
                <button type="submit" style={{ padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600 }}>Update</button>
              </div>
            </form>
          </div>

          {/* Breakdown Tables */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: 16, fontWeight: 700, borderBottom: '1px solid #e5e7eb' }}>Storage by User (Top 50)</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <tr>
                      <th style={{ textAlign: 'left', padding: 12 }}>User</th>
                      <th style={{ textAlign: 'left', padding: 12 }}>Plan</th>
                      <th style={{ textAlign: 'left', padding: 12 }}>Storage</th>
                      <th style={{ textAlign: 'left', padding: 12 }}>Transfers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats as any).storageByUser?.map((u: any) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: 12 }}>
                          <div style={{ fontWeight: 600 }}>{u.name || 'N/A'}</div>
                          <div style={{ color: '#6b7280', fontSize: 12 }}>{u.email}</div>
                        </td>
                        <td style={{ padding: 12 }}>{u.plan}</td>
                        <td style={{ padding: 12 }}>{formatBytes(u.storage_bytes)}</td>
                        <td style={{ padding: 12 }}>{u.transfers_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: 16, fontWeight: 700, borderBottom: '1px solid #e5e7eb' }}>Transfers by User (Top 50)</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <tr>
                      <th style={{ textAlign: 'left', padding: 12 }}>User</th>
                      <th style={{ textAlign: 'left', padding: 12 }}>Plan</th>
                      <th style={{ textAlign: 'left', padding: 12 }}>Transfers</th>
                      <th style={{ textAlign: 'left', padding: 12 }}>Total Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats as any).transfersByUser?.map((u: any) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: 12 }}>
                          <div style={{ fontWeight: 600 }}>{u.name || 'N/A'}</div>
                          <div style={{ color: '#6b7280', fontSize: 12 }}>{u.email}</div>
                        </td>
                        <td style={{ padding: 12 }}>{u.plan}</td>
                        <td style={{ padding: 12 }}>{u.transfers_count}</td>
                        <td style={{ padding: 12 }}>{formatBytes(u.total_bytes)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          {/* Filters */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
          }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 250,
                  padding: '10px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                }}
              />
              <select
                value={selectedPlanFilter}
                onChange={(e) => setSelectedPlanFilter(e.target.value)}
                aria-label="Filter by plan"
                style={{
                  padding: '10px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                  minWidth: 150,
                }}
              >
                <option value="">All Plans</option>
                <option value="FREE">Free</option>
                <option value="PRO">Pro</option>
                <option value="BUSINESS">Business</option>
              </select>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedPlanFilter('');
                  setCurrentPage(1);
                }}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <tr>
                    <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>
                      User
                    </th>
                    <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>
                      Plan
                    </th>
                    <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>
                      Transfers
                    </th>
                    <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>
                      Storage
                    </th>
                    <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>
                      Joined
                    </th>
                    <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: 16 }}>
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: 4 }}>{user.name || 'N/A'}</div>
                          <div style={{ fontSize: 13, color: '#6b7280' }}>{user.email}</div>
                        </div>
                      </td>
                      <td style={{ padding: 16 }}>
                        <select
                          value={user.plan}
                          onChange={(e) => updateUserPlan(user.id, e.target.value)}
                          aria-label={`Change plan for ${user.email}`}
                          style={{
                            padding: '6px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: 6,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <option value="FREE">FREE</option>
                          <option value="PRO">PRO</option>
                          <option value="BUSINESS">BUSINESS</option>
                        </select>
                      </td>
                      <td style={{ padding: 16, fontSize: 14 }}>
                        {user.total_transfers}
                      </td>
                      <td style={{ padding: 16, fontSize: 14 }}>
                        {formatBytes(user.storage_used_bytes)}
                      </td>
                      <td style={{ padding: 16, fontSize: 14, color: '#6b7280' }}>
                        {formatDate(user.created_at)}
                      </td>
                      <td style={{ padding: 16 }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => router.push(`/superadmin/users/${user.id}`)}
                            style={{
                              padding: '6px 12px',
                              background: '#667eea',
                              color: 'white',
                              border: 'none',
                              borderRadius: 6,
                              fontSize: 13,
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Details
                          </button>
                          {(user as any).role !== 'SUPER_ADMIN' && (
                          <button
                            onClick={async () => {
                              const confirmDelete = confirm('Delete this user? This cannot be undone.');
                              if (!confirmDelete) return;
                              try {
                                const res = await fetch(`/api/superadmin/users/${user.id}`, { method: 'DELETE' });
                                if (res.ok) {
                                  fetchUsers();
                                  alert('User deleted');
                                } else {
                                  const j = await res.json();
                                  alert(j.error || 'Failed to delete user');
                                }
                              } catch (_) {
                                alert('Failed to delete user');
                              }
                            }}
                            style={{
                              padding: '6px 12px',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: 6,
                              fontSize: 13,
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Delete
                          </button>
                          )}
                          {(user as any).role !== 'SUPER_ADMIN' && (
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch(`/api/superadmin/users/${user.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ is_blocked: !(user as any).is_blocked })
                                });
                                if (res.ok) {
                                  fetchUsers();
                                } else {
                                  const j = await res.json();
                                  alert(j.error || 'Failed to update');
                                }
                              } catch (_) {
                                alert('Failed to update user');
                              }
                            }}
                            style={{
                              padding: '6px 12px',
                              background: '#6b7280',
                              color: 'white',
                              border: 'none',
                              borderRadius: 6,
                              fontSize: 13,
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            {(user as any).is_blocked ? 'Unblock' : 'Block'}
                          </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 16,
              borderTop: '1px solid #e5e7eb',
            }}>
              <div style={{ fontSize: 14, color: '#6b7280' }}>
                Page {currentPage} of {totalPages}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 16px',
                    background: currentPage === 1 ? '#f3f4f6' : '#667eea',
                    color: currentPage === 1 ? '#9ca3af' : 'white',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 16px',
                    background: currentPage === totalPages ? '#f3f4f6' : '#667eea',
                    color: currentPage === totalPages ? '#9ca3af' : 'white',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics & Audit tabs placeholders */}
      {activeTab === 'analytics' && (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📊</div>
          <h2>Analytics Dashboard</h2>
          <p style={{ color: '#6b7280' }}>Detailed analytics coming soon...</p>
        </div>
      )}

      {activeTab === 'audit' && (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📝</div>
          <h2>Audit Logs</h2>
          <p style={{ color: '#6b7280' }}>Audit trail coming soon...</p>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      padding: 24,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>
            {title}
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color, marginBottom: 4 }}>
            {value}
          </div>
          {subtitle && (
            <div style={{ fontSize: 12, color: '#9ca3af' }}>
              {subtitle}
            </div>
          )}
        </div>
        <div style={{ fontSize: 36 }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

