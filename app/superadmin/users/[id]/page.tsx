'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const res = await fetch(`/api/superadmin/users/${userId}`);
        const json = await res.json();
        if (!res.ok || !json.success) {
          setError(json.error || 'Failed to load user');
        } else {
          setData(json);
        }
      } catch (_) {
        setError('Failed to connect to server');
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (loading) {
    return <div style={{ padding: 24 }}>Loading user...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 12, color: '#b91c1c' }}>{error}</div>
        <button onClick={() => router.back()} style={{ padding: '8px 12px' }}>Back</button>
      </div>
    );
  }

  const { user, transfers, usage } = data || {};

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      <button onClick={() => router.back()} style={{ padding: '8px 12px', marginBottom: 16 }}>← Back</button>
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
        <h1 style={{ marginTop: 0 }}>User Details</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><strong>Email:</strong> {user?.email}</div>
          <div><strong>Name:</strong> {user?.name || 'N/A'}</div>
          <div><strong>Plan:</strong> {user?.plan}</div>
          <div><strong>Role:</strong> {user?.role}</div>
          <div><strong>Created:</strong> {new Date(user?.created_at).toLocaleString()}</div>
          <div><strong>Total Transfers:</strong> {user?.total_transfers}</div>
        </div>
      </div>

      <div style={{ marginTop: 24, background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
        <h2 style={{ marginTop: 0 }}>Recent Transfers</h2>
        {Array.isArray(transfers) && transfers.length > 0 ? (
          <ul>
            {transfers.map((t: any) => (
              <li key={t.id}>
                {t.slug} · {t.status} · {new Date(t.created_at).toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <div>No recent transfers.</div>
        )}
      </div>

      <div style={{ marginTop: 24, background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
        <h2 style={{ marginTop: 0 }}>Usage (last 12 months)</h2>
        {Array.isArray(usage) && usage.length > 0 ? (
          <ul>
            {usage.map((u: any) => (
              <li key={u.month}>
                {u.month}: {u.transfers_count} transfers, {u.total_size_bytes} bytes
              </li>
            ))}
          </ul>
        ) : (
          <div>No usage data.</div>
        )}
      </div>
    </div>
  );
}


