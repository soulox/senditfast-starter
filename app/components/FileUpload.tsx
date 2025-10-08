'use client';

import { useState, useRef, DragEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface FileWithProgress {
  file: File;
  progress: number;
  uploadId?: string;
  key?: string;
  etags?: string[];
  error?: string;
}

export default function FileUpload() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [globalError, setGlobalError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [pendingTransfer, setPendingTransfer] = useState<{ id: string; slug: string } | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const items = Array.from(e.dataTransfer.items);
    const droppedFiles: File[] = [];

    // Process all items (files and folders)
    for (const item of items) {
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry();
        if (entry) {
          await processEntry(entry, droppedFiles);
        }
      }
    }

    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  };

  // Recursively process directory entries
  const processEntry = async (entry: any, files: File[], path: string = ''): Promise<void> => {
    if (entry.isFile) {
      return new Promise((resolve) => {
        entry.file((file: File) => {
          // Preserve folder structure in file name
          const fullPath = path ? `${path}/${file.name}` : file.name;
          const fileWithPath = new File([file], fullPath, { type: file.type });
          files.push(fileWithPath);
          resolve();
        });
      });
    } else if (entry.isDirectory) {
      const reader = entry.createReader();
      return new Promise((resolve) => {
        reader.readEntries(async (entries: any[]) => {
          for (const childEntry of entries) {
            await processEntry(childEntry, files, path ? `${path}/${entry.name}` : entry.name);
          }
          resolve();
        });
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const filesWithProgress = newFiles.map((file) => ({
      file,
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...filesWithProgress]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (fileWithProgress: FileWithProgress, index: number) => {
    const { file } = fileWithProgress;

    try {
      // Step 1: Initialize multipart upload
      const initRes = await fetch('/api/upload/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          contentType: file.type || 'application/octet-stream',
        }),
      });

      if (!initRes.ok) {
        const error = await initRes.json();
        throw new Error(error.error || 'Failed to initialize upload');
      }

      const { uploadId, key, partUrls, partSize } = await initRes.json();

      // Update file with uploadId and key
      setFiles((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], uploadId, key, etags: [] };
        return updated;
      });

      // Step 2: Upload file parts
      const parts: { PartNumber: number; ETag: string }[] = [];
      const totalParts = partUrls.length;

      for (let i = 0; i < totalParts; i++) {
        const start = i * partSize;
        const end = Math.min(start + partSize, file.size);
        const chunk = file.slice(start, end);

        // Check if this is a mock URL
        const isMock = partUrls[i].includes('mock-b2.example.com');
        
        if (isMock) {
          // Mock mode: simulate upload with delay
          await new Promise(resolve => setTimeout(resolve, 100));
          parts.push({ PartNumber: i + 1, ETag: `mock-etag-${i + 1}` });
        } else {
          // Upload through our proxy API to avoid CORS issues
          const formData = new FormData();
          formData.append('file', chunk);
          formData.append('partUrl', partUrls[i]);
          formData.append('partNumber', (i + 1).toString());
          formData.append('uploadId', uploadId);
          formData.append('key', key);

          const uploadRes = await fetch('/api/upload/parts', {
            method: 'POST',
            body: formData,
          });

          if (!uploadRes.ok) {
            const error = await uploadRes.json();
            throw new Error(error.error || `Upload failed: ${uploadRes.status}`);
          }

          const { etag } = await uploadRes.json();
          parts.push({ PartNumber: i + 1, ETag: etag });
        }

        // Update progress
        const progress = ((i + 1) / totalParts) * 100;
        setFiles((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], progress };
          return updated;
        });
      }

      // Step 3: Complete multipart upload
      const completeRes = await fetch('/api/upload/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadId,
          key,
          parts,
        }),
      });

      if (!completeRes.ok) {
        const error = await completeRes.json();
        throw new Error(error.error || 'Failed to complete upload');
      }

      setFiles((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], progress: 100 };
        return updated;
      });
    } catch (error) {
      console.error('Upload error:', error);
      setFiles((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          error: error instanceof Error ? error.message : 'Upload failed',
        };
        return updated;
      });
    }
  };

  const handleUploadAll = async () => {
    if (files.length === 0) {
      setGlobalError('Please select files to upload first.');
      return;
    }
    
    setIsUploading(true);
    setGlobalError('');
    
    try {
      await Promise.all(files.map((file, index) => uploadFile(file, index)));
    } catch (error) {
      console.error('Upload error:', error);
      setGlobalError('Some files failed to upload. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateTransfer = async () => {
    setGlobalError('');

    // Check if user is authenticated
    if (status === 'unauthenticated') {
      setGlobalError('You must be signed in to create transfers');
      setTimeout(() => {
        router.push(`/auth/signin?callbackUrl=/new`);
      }, 2000);
      return;
    }

    try {
      // Create transfer with all uploaded files
      const transferFiles = files
        .filter((f) => f.progress === 100 && f.key)
        .map((f) => ({
          b2_key: f.key,
          name: f.file.name,
          size_bytes: f.file.size,
          content_type: f.file.type || 'application/octet-stream',
        }));

      if (transferFiles.length === 0) {
        setGlobalError('No files uploaded successfully. Please try again.');
        return;
      }

      const res = await fetch('/api/transfers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: transferFiles,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        if (res.status === 401) {
          setGlobalError('Session expired. Redirecting to sign in...');
          setTimeout(() => {
            router.push(`/auth/signin?callbackUrl=/new`);
          }, 2000);
          return;
        }
        throw new Error(error.error || 'Failed to create transfer');
      }

      const { id, slug } = await res.json();

      // Show email modal
      setPendingTransfer({ id, slug });
      setShowEmailModal(true);
    } catch (error) {
      console.error('Create transfer error:', error);
      setGlobalError(error instanceof Error ? error.message : 'Failed to create transfer');
    }
  };

  const skipEmail = () => {
    if (pendingTransfer) {
      window.location.href = `/share/${pendingTransfer.slug}`;
    }
  };

  const sendEmailNotification = async () => {
    if (!pendingTransfer) return;

    setSendingEmail(true);
    try {
      const recipients = emailRecipients.split(',').map((e) => e.trim()).filter((e) => e);
      
      if (recipients.length === 0) {
        setGlobalError('Please enter at least one email address');
        setSendingEmail(false);
        return;
      }

      await fetch(`/api/transfers/${pendingTransfer.id}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          recipients, 
          message: emailMessage || undefined 
        }),
      });

      // Redirect to share page
      window.location.href = `/share/${pendingTransfer.slug}`;
    } catch (error) {
      console.error('Email send error:', error);
      setGlobalError('Failed to send email notifications');
      setSendingEmail(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const allFilesUploaded = files.length > 0 && files.every((f) => f.progress === 100);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h1>Send Files</h1>

      {/* Authentication Warning */}
      {status === 'loading' && (
        <div
          style={{
            padding: 16,
            backgroundColor: '#f0f8ff',
            border: '1px solid #0070f3',
            borderRadius: 4,
            marginBottom: 24,
            textAlign: 'center',
          }}
        >
          <p style={{ margin: 0, color: '#0070f3' }}>⏳ Checking authentication...</p>
        </div>
      )}

      {status === 'unauthenticated' && (
        <div
          style={{
            padding: 16,
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: 4,
            marginBottom: 24,
          }}
        >
          <p style={{ margin: 0, fontWeight: 500, marginBottom: 8 }}>⚠️ Sign In Required</p>
          <p style={{ margin: 0, fontSize: 14, marginBottom: 12 }}>
            You must be signed in to upload and share files.
          </p>
          <button
            onClick={() => router.push(`/auth/signin?callbackUrl=/new`)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ffc107',
              color: '#000',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Sign In Now →
          </button>
        </div>
      )}

      {status === 'authenticated' && (
        <div
          style={{
            padding: 12,
            backgroundColor: '#d4edda',
            border: '1px solid #28a745',
            borderRadius: 4,
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <p style={{ margin: 0, fontSize: 14, color: '#155724' }}>
            ✓ Signed in as <strong>{session?.user?.email}</strong>
          </p>
        </div>
      )}

      {/* Global Error */}
      {globalError && (
        <div
          style={{
            padding: 16,
            backgroundColor: '#f8d7da',
            border: '1px solid #f44',
            borderRadius: 4,
            marginBottom: 24,
          }}
        >
          <p style={{ margin: 0, color: '#721c24', fontWeight: 500 }}>❌ {globalError}</p>
        </div>
      )}

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: isDragging ? '2px dashed #0070f3' : '2px dashed #ddd',
          borderRadius: 8,
          padding: 48,
          textAlign: 'center',
          backgroundColor: isDragging ? '#f0f8ff' : '#fafafa',
          marginBottom: 24,
        }}
      >
        <p style={{ fontSize: 18, marginBottom: 8 }}>
          {isDragging ? 'Drop files or folders here' : 'Drag & drop files or folders here'}
        </p>
        <p style={{ color: '#666', fontSize: 14, marginBottom: 16 }}>or</p>
        
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
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
            📄 Browse Files
          </button>
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.webkitdirectory = true;
              input.multiple = true;
              input.onchange = (e: any) => handleFolderSelect(e);
              input.click();
            }}
            style={{
              padding: '12px 24px',
              background: '#f3f4f6',
              color: '#667eea',
              border: '2px solid #667eea',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            📁 Browse Folders
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          aria-label="File upload input"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3>Files ({files.length})</h3>
          {files.map((fileWithProgress, index) => (
            <div
              key={index}
              style={{
                border: '1px solid #eee',
                borderRadius: 4,
                padding: 12,
                marginBottom: 8,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <strong>{fileWithProgress.file.name}</strong>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    {formatFileSize(fileWithProgress.file.size)}
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#666',
                    cursor: 'pointer',
                    fontSize: 18,
                  }}
                >
                  ×
                </button>
              </div>

              {fileWithProgress.progress > 0 && (
                <div>
                  <div
                    style={{
                      height: 4,
                      backgroundColor: '#eee',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        backgroundColor: fileWithProgress.error ? '#f44' : '#0070f3',
                        width: `${fileWithProgress.progress}%`,
                        transition: 'width 0.3s',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    {fileWithProgress.error
                      ? `Error: ${fileWithProgress.error}`
                      : `${Math.round(fileWithProgress.progress)}%`}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {files.length > 0 && (
        <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
          {status === 'unauthenticated' && (
            <div
              style={{
                padding: 12,
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: 4,
                fontSize: 14,
              }}
            >
              ⚠️ Please sign in to upload files
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            {!allFilesUploaded && (
              <button
                onClick={handleUploadAll}
                disabled={isUploading || status === 'unauthenticated'}
                style={{
                  padding: '12px 24px',
                  backgroundColor: status === 'unauthenticated' ? '#ccc' : '#0070f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: isUploading || status === 'unauthenticated' ? 'not-allowed' : 'pointer',
                  fontSize: 16,
                  opacity: isUploading || status === 'unauthenticated' ? 0.6 : 1,
                }}
                title={status === 'unauthenticated' ? 'Sign in to upload' : ''}
              >
                {isUploading ? 'Uploading...' : 'Upload All'}
              </button>
            )}

            {allFilesUploaded && (
              <button
                onClick={handleCreateTransfer}
                disabled={status === 'unauthenticated'}
                style={{
                  padding: '12px 24px',
                  backgroundColor: status === 'unauthenticated' ? '#ccc' : '#00c853',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: status === 'unauthenticated' ? 'not-allowed' : 'pointer',
                  fontSize: 16,
                  opacity: status === 'unauthenticated' ? 0.6 : 1,
                }}
                title={status === 'unauthenticated' ? 'Sign in to create transfer' : ''}
              >
                Create Transfer
              </button>
            )}
          </div>
        </div>
      )}

      {/* Email Notification Modal */}
      {showEmailModal && (
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
          onClick={skipEmail}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '500px',
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
              backgroundColor: '#dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '32px'
            }}>
              ✉️
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '12px',
              textAlign: 'center'
            }}>
              Email Transfer?
            </h2>

            {/* Message */}
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              lineHeight: '1.6',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              Would you like to send email notifications to recipients with the transfer link?
            </p>

            {/* Email Input */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Recipient Emails
              </label>
              <input
                type="text"
                placeholder="email1@example.com, email2@example.com"
                value={emailRecipients}
                onChange={(e) => setEmailRecipients(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '15px',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
              <div style={{
                fontSize: '12px',
                color: '#9ca3af',
                marginTop: '6px'
              }}>
                Separate multiple emails with commas
              </div>
            </div>

            {/* Message Input */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Message (Optional)
              </label>
              <textarea
                placeholder="Add a personal message..."
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '15px',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  fontFamily: 'system-ui, sans-serif'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={skipEmail}
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
                Skip
              </button>
              <button
                onClick={sendEmailNotification}
                disabled={sendingEmail || !emailRecipients.trim()}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  backgroundColor: sendingEmail || !emailRecipients.trim() ? '#9ca3af' : '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: sendingEmail || !emailRecipients.trim() ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  boxShadow: '0 4px 6px rgba(102, 126, 234, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!sendingEmail && emailRecipients.trim()) {
                    e.currentTarget.style.backgroundColor = '#5568d3';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!sendingEmail && emailRecipients.trim()) {
                    e.currentTarget.style.backgroundColor = '#667eea';
                  }
                }}
              >
                {sendingEmail ? 'Sending...' : 'Send Emails'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

