'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
}

export default function ApiKeysPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const userPlan = (session?.user as any)?.plan || 'FREE';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/api-keys');
      return;
    }

    if (status === 'authenticated' && userPlan !== 'BUSINESS') {
      router.push('/pricing');
      return;
    }

    if (status === 'authenticated') {
      fetchApiKeys();
    }
  }, [status, userPlan, router]);

  const fetchApiKeys = async () => {
    try {
      const res = await fetch('/api/api-keys');
      const data = await res.json();
      if (data.success) {
        setKeys(data.keys);
      }
    } catch (err) {
      console.error('Failed to fetch API keys:', err);
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess('');
    setNewKey(null);

    try {
      const res = await fetch('/api/api-keys/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });

      const data = await res.json();

      if (data.success) {
        setNewKey(data.key);
        setName('');
        setSuccess('API key created successfully!');
        fetchApiKeys();
      } else {
        setError(data.error || 'Failed to create API key');
      }
    } catch (err) {
      setError('Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const revokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This cannot be undone.')) return;

    try {
      const res = await fetch(`/api/api-keys/${keyId}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('API key revoked');
        fetchApiKeys();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to revoke key');
      }
    } catch (err) {
      setError('Failed to revoke key');
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setSuccess('API key copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
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
              🔑 API Keys
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255, 255, 255, 0.85)', margin: 0 }}>
              Manage API keys for programmatic access
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

        {/* New API Key Display */}
        {newKey && (
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 24,
            marginBottom: 24,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: '2px solid #10b981'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 18, fontWeight: 600, color: '#065f46' }}>
              🎉 Your New API Key
            </h3>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>
              ⚠️ Copy this key now! You won't be able to see it again.
            </p>
            <div style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              padding: 16,
              background: '#f9fafb',
              borderRadius: 8,
              border: '1px solid #e5e7eb'
            }}>
              <code style={{
                flex: 1,
                fontFamily: 'monospace',
                fontSize: 14,
                color: '#1f2937',
                wordBreak: 'break-all'
              }}>
                {newKey}
              </code>
              <button
                onClick={() => copyKey(newKey)}
                style={{
                  padding: '8px 16px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                📋 Copy
              </button>
            </div>
          </div>
        )}

        {/* Create API Key Form */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: 20, fontWeight: 600 }}>
            ➕ Create New API Key
          </h2>

          <form onSubmit={createApiKey}>
            <div style={{ display: 'flex', gap: 12 }}>
              <input
                type="text"
                placeholder="API Key Name (e.g., Production Server)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={creating}
                style={{
                  flex: 1,
                  padding: 12,
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14
                }}
              />
              <button
                type="submit"
                disabled={creating}
                style={{
                  padding: '12px 24px',
                  background: creating ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: creating ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {creating ? 'Creating...' : 'Create Key'}
              </button>
            </div>
          </form>
        </div>

        {/* API Keys List */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: 20, fontWeight: 600 }}>
            Your API Keys
          </h2>

          {keys.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔑</div>
              <p>No API keys yet. Create your first API key above!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {keys.map((key) => (
                <div
                  key={key.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 16,
                    border: '1px solid #e5e7eb',
                    borderRadius: 8
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', marginBottom: 6 }}>
                      {key.name}
                    </div>
                    <div style={{ fontSize: 13, color: '#6b7280', fontFamily: 'monospace', marginBottom: 6 }}>
                      {key.key_prefix}••••••••••••••••
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>
                      Created {new Date(key.created_at).toLocaleDateString()}
                      {key.last_used_at && ` • Last used ${new Date(key.last_used_at).toLocaleDateString()}`}
                    </div>
                  </div>
                  <button
                    onClick={() => revokeKey(key.id)}
                    style={{
                      padding: '8px 16px',
                      background: 'white',
                      color: '#dc2626',
                      border: '1px solid #dc2626',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* API Documentation Link */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          marginTop: 24,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: 18, fontWeight: 600 }}>
            📚 API Documentation
          </h3>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>
            Learn how to use the SendItFast API to integrate file transfers into your applications.
          </p>
          <Link
            href="/api-docs"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              background: '#f3f4f6',
              color: '#667eea',
              border: '1px solid #667eea',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            View API Docs →
          </Link>
        </div>
      </div>
    </div>
  );
}
