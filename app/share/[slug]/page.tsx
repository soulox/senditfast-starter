'use client';

export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type FileInfo = {
  id: string;
  name: string;
  size_bytes: number;
  content_type?: string;
};

type TransferMeta = {
  slug: string;
  expires_at: string;
  requires_password: boolean;
  files: FileInfo[];
  branding?: {
    logo_url: string | null;
    primary_color: string;
    secondary_color: string;
    company_name: string | null;
  };
};

export default function SharePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [meta, setMeta] = useState<TransferMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<FileInfo | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Branding colors
  const primaryColor = meta?.branding?.primary_color || '#667eea';
  const secondaryColor = meta?.branding?.secondary_color || '#764ba2';
  const companyName = meta?.branding?.company_name || 'SendItFast';
  const logoUrl = meta?.branding?.logo_url;

  useEffect(() => {
    // Track email click if recipient ID is in URL
    const urlParams = new URLSearchParams(window.location.search);
    const recipientId = urlParams.get('r');
    
    if (recipientId) {
      // Track click
      fetch(`/api/email/track/click/${recipientId}`, { method: 'POST' })
        .catch(err => console.error('Click tracking error:', err));
    }

    fetch(`/api/share/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setMeta(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const canPreview = (file: FileInfo) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const type = file.content_type?.toLowerCase() || '';
    
    // Images
    if (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
      return 'image';
    }
    // Videos
    if (type.startsWith('video/') || ['mp4', 'webm', 'ogg'].includes(ext || '')) {
      return 'video';
    }
    // PDFs
    if (type === 'application/pdf' || ext === 'pdf') {
      return 'pdf';
    }
    // Text files
    if (type.startsWith('text/') || ['txt', 'md', 'json', 'xml', 'csv'].includes(ext || '')) {
      return 'text';
    }
    return null;
  };

  const handlePreview = async (file: FileInfo) => {
    try {
      const res = await fetch(`/api/share/${slug}/download?fileId=${file.id}`);
      if (!res.ok) throw new Error('Preview failed');

      const { downloadUrl } = await res.json();
      setPreviewUrl(downloadUrl);
      setPreviewFile(file);
    } catch (error) {
      console.error('Preview error:', error);
      alert('Failed to preview file');
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    setDownloading(fileId);
    try {
      const res = await fetch(`/api/share/${slug}/download?fileId=${fileId}`);
      if (!res.ok) throw new Error('Download failed');

      const { downloadUrl } = await res.json();

      // Open download URL in new tab
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file');
    } finally {
      setDownloading(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
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

  if (!meta) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 40,
          textAlign: 'center',
          maxWidth: 500
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>❌</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', marginBottom: 12 }}>
            Transfer Not Found
          </h2>
          <p style={{ fontSize: 15, color: '#6b7280' }}>
            This transfer may have expired or been deleted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Header with Branding */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 32,
          marginBottom: 24,
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          {logoUrl && (
            <img
              src={logoUrl}
              alt={companyName}
              style={{
                maxHeight: 60,
                marginBottom: 16
              }}
            />
          )}
          <h1 style={{
            fontSize: 32,
            fontWeight: 700,
            color: '#1f2937',
            margin: '0 0 8px 0'
          }}>
            {companyName} shared files with you
          </h1>
          <p style={{
            fontSize: 15,
            color: '#6b7280',
            margin: 0
          }}>
            {meta.files.length} file{meta.files.length > 1 ? 's' : ''} available for download
          </p>
        </div>

        {meta.requires_password && (
          <div style={{
            background: '#fef3c7',
            border: '2px solid #f59e0b',
            borderRadius: 8,
            padding: 16,
            marginBottom: 24,
            textAlign: 'center'
          }}>
            <p style={{ color: '#92400e', margin: 0, fontWeight: 600 }}>
              🔒 This transfer is password-protected
            </p>
          </div>
        )}

        {/* Files List */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 600,
            color: '#1f2937',
            marginBottom: 20
          }}>
            📦 Files
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {meta.files?.map((file) => {
              const previewType = canPreview(file);
              return (
                <div
                  key={file.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    padding: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'border-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = primaryColor}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                >
              <div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>{file.name}</div>
                <div style={{ fontSize: 14, color: '#666' }}>
                  {formatFileSize(file.size_bytes)}
                  {previewType && (
                    <span style={{
                      marginLeft: 8,
                      fontSize: 12,
                      background: '#dbeafe',
                      color: '#1e40af',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontWeight: 600
                    }}>
                      👁️ Previewable
                    </span>
                  )}
                </div>
              </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {previewType && (
                      <button
                        onClick={() => handlePreview(file)}
                        style={{
                          padding: '10px 16px',
                          backgroundColor: '#f3f4f6',
                          color: primaryColor,
                          border: `2px solid ${primaryColor}`,
                          borderRadius: 8,
                          cursor: 'pointer',
                          fontSize: 14,
                          fontWeight: 600,
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = primaryColor;
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                          e.currentTarget.style.color = primaryColor;
                        }}
                      >
                        👁️ Preview
                      </button>
                    )}
                    <button
                      onClick={() => handleDownload(file.id, file.name)}
                      disabled={downloading === file.id}
                      style={{
                        padding: '10px 20px',
                        background: downloading === file.id ? '#9ca3af' : `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: downloading === file.id ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                      }}
                    >
                      {downloading === file.id ? '⏳ Downloading...' : '📥 Download'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expiry Info */}
          <div style={{
            marginTop: 24,
            padding: 16,
            background: '#f9fafb',
            borderRadius: 8,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 13, color: '#6b7280' }}>
              ⏰ Expires: {new Date(meta.expires_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>

        {/* Powered By */}
        <div style={{
          textAlign: 'center',
          marginTop: 24,
          fontSize: 13,
          color: 'rgba(255, 255, 255, 0.8)'
        }}>
          Powered by <strong style={{ color: 'white' }}>SendItFast</strong>
        </div>
      </div>

      {/* File Preview Modal */}
      {previewFile && previewUrl && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20
          }}
          onClick={() => {
            setPreviewFile(null);
            setPreviewUrl(null);
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 12,
              padding: 24,
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              paddingBottom: 16,
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1f2937', margin: 0 }}>
                  {previewFile.name}
                </h3>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                  {formatFileSize(previewFile.size_bytes)}
                </div>
              </div>
              <button
                onClick={() => {
                  setPreviewFile(null);
                  setPreviewUrl(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 24,
                  color: '#6b7280',
                  cursor: 'pointer',
                  padding: 8
                }}
              >
                ×
              </button>
            </div>

            {/* Preview Content */}
            <div style={{ textAlign: 'center' }}>
              {canPreview(previewFile) === 'image' && (
                <img
                  src={previewUrl}
                  alt={previewFile.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    borderRadius: 8
                  }}
                />
              )}

              {canPreview(previewFile) === 'video' && (
                <video
                  controls
                  style={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    borderRadius: 8
                  }}
                >
                  <source src={previewUrl} type={previewFile.content_type} />
                  Your browser doesn't support video playback.
                </video>
              )}

              {canPreview(previewFile) === 'pdf' && (
                <iframe
                  src={previewUrl}
                  style={{
                    width: '80vw',
                    height: '70vh',
                    border: 'none',
                    borderRadius: 8
                  }}
                  title={previewFile.name}
                />
              )}
            </div>

            {/* Download Button */}
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <button
                onClick={() => handleDownload(previewFile.id, previewFile.name)}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
              >
                📥 Download File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
