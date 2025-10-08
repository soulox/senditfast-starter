'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

type Transfer = {
  id: string;
  slug: string;
  total_size_bytes: number;
  status: string;
  created_at: string;
  expires_at: string;
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/dashboard');
      return;
    }

    if (status === 'authenticated') {
      fetch('/api/transfers')
        .then(r => r.json())
        .then(d => {
      setItems(d.items || []);
      setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, router]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getExpiryStatus = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / 86400000);

    if (diffDays < 0) return { text: 'Expired', color: '#ef4444' };
    if (diffDays === 0) return { text: 'Expires today', color: '#f97316' };
    if (diffDays === 1) return { text: 'Expires tomorrow', color: '#f59e0b' };
    return { text: `${diffDays} days left`, color: '#10b981' };
  };

  const copyShareLink = (slug: string) => {
    const url = `${window.location.origin}/share/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const confirmDelete = (transferId: string) => {
    setDeleteConfirmId(transferId);
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const deleteTransfer = async (transferId: string) => {
    setDeleteConfirmId(null);
    setDeletingId(transferId);

    try {
      const res = await fetch(`/api/transfers/${transferId}/delete`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete transfer');
      }

      // Remove from local state
      setItems((prev) => prev.filter((t) => t.id !== transferId));
    } catch (error) {
      console.error('Delete error:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete transfer');
    } finally {
      setDeletingId(null);
    }
  };

  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          fontSize: '18px',
          color: 'white',
          fontWeight: '500'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  const userPlan = (session?.user as any)?.plan || 'FREE';
  const planLimits = {
    FREE: { maxSize: '10 GB', expiry: '7 days', transfers: '5/month', color: '#0ea5e9' },
    PRO: { maxSize: '100 GB', expiry: '30 days', transfers: 'Unlimited', color: '#667eea' },
    BUSINESS: { maxSize: '250 GB', expiry: '90 days', transfers: 'Unlimited', color: '#f59e0b' }
  };
  const currentLimits = planLimits[userPlan as keyof typeof planLimits] || planLimits.FREE;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Upgrade Success Banner */}
        {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('upgraded') === 'true' && (
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            padding: '20px 28px',
            borderRadius: '12px',
            marginBottom: '24px',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '32px' }}>🎉</div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>
                  Welcome to {userPlan}!
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  Your plan has been upgraded. Enjoy your new features!
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.delete('upgraded');
                window.history.replaceState({}, '', url.toString());
                window.location.reload();
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Plan Features Card */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          display: 'grid',
          gridTemplateColumns: userPlan === 'FREE' ? '1fr auto' : 'repeat(4, 1fr)',
          gap: '24px',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Current Plan
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '24px',
                fontWeight: '700',
                background: `linear-gradient(135deg, ${currentLimits.color} 0%, ${currentLimits.color}dd 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {userPlan}
              </span>
              {userPlan === 'FREE' && (
                <span style={{
                  fontSize: '11px',
                  background: '#fef3c7',
                  color: '#92400e',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontWeight: '600'
                }}>
                  Limited
                </span>
              )}
            </div>
          </div>

          {userPlan !== 'FREE' && (
            <>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Max File Size</div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>{currentLimits.maxSize}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Expiry</div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>{currentLimits.expiry}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Transfers</div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>{currentLimits.transfers}</div>
              </div>
            </>
          )}

          {userPlan === 'FREE' && (
            <Link
              href="/pricing"
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-block',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                whiteSpace: 'nowrap'
              }}
            >
              ⚡ Upgrade to Pro
            </Link>
          )}
        </div>

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: 'white',
              margin: '0 0 6px 0'
            }}>
              My Transfers
            </h1>
            <p style={{
              fontSize: '15px',
              color: 'rgba(255, 255, 255, 0.85)',
              margin: 0
            }}>
              {items.length} {items.length === 1 ? 'transfer' : 'transfers'}
            </p>
          </div>
          <Link
            href="/new"
            style={{
              padding: '14px 28px',
              backgroundColor: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'inline-block',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }}
          >
            + New Transfer
          </Link>
        </div>

        {/* Transfers Grid */}
        {items.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '60px 40px',
            textAlign: 'center',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              📦
            </div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 12px 0'
            }}>
              No transfers yet
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              marginBottom: '24px'
            }}>
              Create your first transfer to share files securely
            </p>
            <Link
              href="/new"
              style={{
                padding: '12px 24px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              Create Transfer
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            {items.map(transfer => {
              const expiry = getExpiryStatus(transfer.expires_at);
              return (
                <div
                  key={transfer.id}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  {/* Status Badge */}
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    backgroundColor: transfer.status === 'ACTIVE' ? '#d1fae5' : '#fee2e2',
                    color: transfer.status === 'ACTIVE' ? '#065f46' : '#991b1b',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '16px'
                  }}>
                    {transfer.status}
                  </div>

                  {/* Transfer Info */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      marginBottom: '4px'
                    }}>
                      Share Link
                    </div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1f2937',
                      fontFamily: 'monospace',
                      wordBreak: 'break-all'
                    }}>
                      {transfer.slug}
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    marginBottom: '20px'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        marginBottom: '4px'
                      }}>
                        Size
                      </div>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#1f2937'
                      }}>
                        {formatBytes(transfer.total_size_bytes)}
                      </div>
                    </div>
    <div>
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        marginBottom: '4px'
                      }}>
                        Created
                      </div>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#1f2937'
                      }}>
                        {formatDate(transfer.created_at)}
                      </div>
                    </div>
                  </div>

                  {/* Expiry */}
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      marginBottom: '4px'
                    }}>
                      Expiration
                    </div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: expiry.color
                    }}>
                      {expiry.text}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => copyShareLink(transfer.slug)}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          backgroundColor: copiedSlug === transfer.slug ? '#10b981' : '#667eea',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (copiedSlug !== transfer.slug) {
                            e.currentTarget.style.backgroundColor = '#5568d3';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (copiedSlug !== transfer.slug) {
                            e.currentTarget.style.backgroundColor = '#667eea';
                          }
                        }}
                      >
                        {copiedSlug === transfer.slug ? '✓ Copied!' : 'Copy Link'}
                      </button>
                      <button
                        onClick={() => setShowQRCode(transfer.slug)}
                        style={{
                          padding: '10px 16px',
                          backgroundColor: 'white',
                          color: '#667eea',
                          border: '2px solid #667eea',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s, color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#667eea';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.color = '#667eea';
                        }}
                      >
                        📱 QR
                      </button>
                      <Link
                        href={`/share/${transfer.slug}`}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          backgroundColor: 'white',
                          color: '#667eea',
                          border: '2px solid #667eea',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          textDecoration: 'none',
                          textAlign: 'center',
                          transition: 'background-color 0.2s, color 0.2s',
                          display: 'block'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#667eea';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.color = '#667eea';
                        }}
                      >
                        View
                      </Link>
                    </div>
                    <button
                      onClick={() => confirmDelete(transfer.id)}
                      disabled={deletingId === transfer.id}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        backgroundColor: 'white',
                        color: '#ef4444',
                        border: '2px solid #ef4444',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: deletingId === transfer.id ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s, color 0.2s',
                        opacity: deletingId === transfer.id ? 0.6 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (deletingId !== transfer.id) {
                          e.currentTarget.style.backgroundColor = '#ef4444';
                          e.currentTarget.style.color = 'white';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (deletingId !== transfer.id) {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.color = '#ef4444';
                        }
                      }}
                    >
                      {deletingId === transfer.id ? 'Deleting...' : '🗑️ Delete'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={cancelDelete}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              animation: 'slideUp 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '32px'
            }}>
              🗑️
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '12px',
              textAlign: 'center'
            }}>
              Delete Transfer?
            </h2>

            {/* Message */}
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              lineHeight: '1.6',
              marginBottom: '32px',
              textAlign: 'center'
            }}>
              Are you sure you want to delete this transfer? This action cannot be undone and all files will be permanently removed.
            </p>

            {/* Transfer Info */}
            {(() => {
              const transfer = items.find(t => t.id === deleteConfirmId);
              return transfer ? (
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    marginBottom: '4px'
                  }}>
                    Transfer
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937',
                    fontFamily: 'monospace'
                  }}>
                    {transfer.slug}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={cancelDelete}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteTransfer(deleteConfirmId)}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  boxShadow: '0 4px 6px rgba(239, 68, 68, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ef4444';
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRCode && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setShowQRCode(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              animation: 'slideUp 0.3s ease-out',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title */}
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '12px'
            }}>
              📱 QR Code
            </h2>

            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '24px'
            }}>
              Scan this QR code to access the transfer on your mobile device
            </p>

            {/* QR Code */}
            <div style={{
              padding: '20px',
              background: 'white',
              borderRadius: '12px',
              display: 'inline-block',
              marginBottom: '24px',
              border: '2px solid #e5e7eb'
            }}>
              <QRCodeSVG
                value={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:3000'}/share/${showQRCode}`}
                size={256}
                level="H"
                includeMargin={false}
              />
            </div>

            {/* Transfer Slug */}
            <div style={{
              padding: '12px',
              background: '#f9fafb',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <div style={{
                fontSize: '12px',
                color: '#6b7280',
                marginBottom: '4px'
              }}>
                Transfer Code
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                fontFamily: 'monospace'
              }}>
                {showQRCode}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  const svg = document.querySelector('svg');
                  if (svg) {
                    const svgData = new XMLSerializer().serializeToString(svg);
                    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                    const url = URL.createObjectURL(svgBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `qr-code-${showQRCode}.svg`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }
                }}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
              >
                💾 Download
              </button>
              <button
                onClick={() => setShowQRCode(null)}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: '#f3f4f6',
                  color: '#6b7280',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
