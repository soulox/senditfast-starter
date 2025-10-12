'use client';

import { useState, useRef, DragEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface FileWithProgress {
  file: File;
  progress: number;
  uploadId?: string;
  key?: string;
  error?: string;
}

type WizardStep = 'select' | 'upload' | 'settings' | 'email' | 'complete';

export default function FileUploadWizard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('select');
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  
  // File upload state
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Transfer settings state
  const [password, setPassword] = useState('');
  const [expiryDays, setExpiryDays] = useState(7);
  
  // Email state
  const [emailRecipients, setEmailRecipients] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  
  // Transfer result
  const [transferSlug, setTransferSlug] = useState('');
  const [transferId, setTransferId] = useState('');
  
  // Error state
  const [globalError, setGlobalError] = useState('');

  const steps = [
    { id: 'select', label: 'Select Files', icon: '📁' },
    { id: 'upload', label: 'Upload', icon: '⬆️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'email', label: 'Notify', icon: '✉️' },
  ];

  const getStepIndex = (step: WizardStep) => {
    if (step === 'complete') return steps.length;
    return steps.findIndex(s => s.id === step);
  };

  // File handlers
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setFiles((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], uploadId, key };
        return updated;
      });

      // Step 2: Upload file parts through proxy API
      const parts: { PartNumber: number; ETag: string }[] = [];
      const totalParts = partUrls.length;

      for (let i = 0; i < totalParts; i++) {
        const start = i * partSize;
        const end = Math.min(start + partSize, file.size);
        const chunk = file.slice(start, end);

        const isMock = partUrls[i].includes('mock-b2.example.com');
        
        if (isMock) {
          await new Promise(resolve => setTimeout(resolve, 100));
          parts.push({ PartNumber: i + 1, ETag: `mock-etag-${i + 1}` });
        } else {
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

        const progress = Math.min(100, Math.round(((i + 1) / totalParts) * 100));
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
        throw new Error('Failed to complete upload');
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
      // Auto-advance to settings step
      setCurrentStep('settings');
    } catch (error) {
      console.error('Upload error:', error);
      setGlobalError('Some files failed to upload. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateTransfer = async () => {
    setGlobalError('');

    if (status === 'unauthenticated') {
      setGlobalError('You must be signed in to create transfers');
      setTimeout(() => {
        router.push(`/auth/signin?callbackUrl=/new`);
      }, 2000);
      return;
    }

    try {
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

      const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString();

      const res = await fetch('/api/transfers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: transferFiles,
          password: password || undefined,
          expiresAt,
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
      setTransferId(id);
      setTransferSlug(slug);
      
      // Move to email step
      setCurrentStep('email');
    } catch (error) {
      console.error('Create transfer error:', error);
      setGlobalError(error instanceof Error ? error.message : 'Failed to create transfer');
    }
  };

  const sendEmailNotification = async () => {
    setSendingEmail(true);
    try {
      const recipients = emailRecipients.split(',').map((e) => e.trim()).filter((e) => e);
      
      if (recipients.length > 0) {
        await fetch(`/api/transfers/${transferId}/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            recipients, 
            message: emailMessage || undefined 
          }),
        });
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Email send error:', error);
      setGlobalError('Failed to send email notifications');
      setSendingEmail(false);
    }
  };

  const skipEmail = () => {
    router.push('/dashboard');
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Wizard Progress */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            {steps.map((step, index) => {
              const stepIndex = getStepIndex(step.id as WizardStep);
              const currentStepIndex = getStepIndex(currentStep);
              const isCompleted = stepIndex < currentStepIndex;
              const isCurrent = step.id === currentStep;
              
              return (
                <div key={step.id} style={{ flex: 1, position: 'relative' }}>
                  {index > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '20px',
                      left: '-50%',
                      right: '50%',
                      height: '3px',
                      backgroundColor: isCompleted ? '#667eea' : '#e5e7eb',
                      transition: 'background-color 0.3s'
                    }} />
                  )}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: isCompleted || isCurrent ? '#667eea' : '#e5e7eb',
                      color: isCompleted || isCurrent ? 'white' : '#9ca3af',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      fontWeight: '600',
                      transition: 'all 0.3s',
                      border: isCurrent ? '3px solid #764ba2' : 'none',
                      boxShadow: isCurrent ? '0 0 0 4px rgba(102, 126, 234, 0.2)' : 'none'
                    }}>
                      {isCompleted ? '✓' : step.icon}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: isCurrent ? '600' : '500',
                      color: isCurrent ? '#667eea' : '#6b7280',
                      marginTop: '8px',
                      textAlign: 'center'
                    }}>
                      {step.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
          minHeight: '400px'
        }}>
          {/* Global Error */}
          {globalError && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              color: '#dc2626'
            }}>
              {globalError}
            </div>
          )}

          {/* Auth Warning */}
          {status === 'unauthenticated' && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              color: '#92400e'
            }}>
              ⚠️ Please sign in to upload files
              <button
                onClick={() => router.push('/auth/signin?callbackUrl=/new')}
                style={{
                  marginLeft: '12px',
                  padding: '6px 12px',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                Sign In
              </button>
            </div>
          )}

          {/* Step 1: Select Files */}
          {currentStep === 'select' && (
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '16px'
              }}>
                Select Files to Send
              </h2>
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                marginBottom: '24px'
              }}>
                Choose files from your device or drag and drop them below
              </p>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `3px dashed ${isDragging ? '#667eea' : '#d1d5db'}`,
                  borderRadius: '12px',
                  padding: '48px 24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: isDragging ? '#f0f4ff' : '#f9fafb',
                  transition: 'all 0.3s',
                  marginBottom: '24px'
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
                <p style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '8px'
                }}>
                  Drop files here or click to browse
                </p>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  No file size limit • All file types supported
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {/* Selected Files List */}
              {files.length > 0 && (
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '16px'
                  }}>
                    Selected Files ({files.length})
                  </h3>
                  {files.map((f, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      marginBottom: '8px'
                    }}>
                      <div>
                        <div style={{ fontWeight: '500', fontSize: '14px', color: '#1f2937' }}>
                          {f.file.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {formatFileSize(f.file.size)}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#fee2e2',
                          color: '#ef4444',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => setCurrentStep('upload')}
                    disabled={files.length === 0 || status === 'unauthenticated'}
                    style={{
                      width: '100%',
                      padding: '14px',
                      marginTop: '24px',
                      backgroundColor: files.length === 0 || status === 'unauthenticated' ? '#9ca3af' : '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: files.length === 0 || status === 'unauthenticated' ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Continue to Upload →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Upload Files */}
          {currentStep === 'upload' && (
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '16px'
              }}>
                Upload Files
              </h2>
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                marginBottom: '24px'
              }}>
                {isUploading ? 'Uploading your files...' : allFilesUploaded ? 'All files uploaded successfully!' : 'Ready to upload your files'}
              </p>

              {files.map((f, index) => (
                <div key={index} style={{
                  padding: '16px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontWeight: '500', fontSize: '14px', color: '#1f2937' }}>
                      {f.file.name}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>
                      {Math.round(f.progress)}%
                    </div>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${Math.min(100, Math.max(0, Math.round(f.progress)))}%`,
                      height: '100%',
                      backgroundColor: f.error ? '#ef4444' : '#667eea',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  {f.error && (
                    <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '8px' }}>
                      ❌ {f.error}
                    </div>
                  )}
                </div>
              ))}

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  onClick={() => setCurrentStep('select')}
                  disabled={isUploading}
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: 'white',
                    color: '#6b7280',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: isUploading ? 'not-allowed' : 'pointer'
                  }}
                >
                  ← Back
                </button>
                {!allFilesUploaded && (
                  <button
                    onClick={handleUploadAll}
                    disabled={isUploading}
                    style={{
                      flex: 2,
                      padding: '14px',
                      backgroundColor: isUploading ? '#9ca3af' : '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: isUploading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isUploading ? 'Uploading...' : 'Upload All Files'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Transfer Settings */}
          {currentStep === 'settings' && (
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '16px'
              }}>
                Transfer Settings
              </h2>
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                marginBottom: '24px'
              }}>
                Customize your transfer with optional password protection and expiration
              </p>

              {/* Password Protection */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  🔒 Password Protection (Optional)
                </label>
                <input
                  type="password"
                  placeholder="Leave blank for no password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  Recipients will need this password to download files
                </div>
              </div>

              {/* Expiration */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  ⏰ Expires In
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {[1, 3, 7, 14, 30].map((days) => (
                    <button
                      key={days}
                      onClick={() => setExpiryDays(days)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: expiryDays === days ? '#667eea' : 'white',
                        color: expiryDays === days ? 'white' : '#6b7280',
                        border: `2px solid ${expiryDays === days ? '#667eea' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {days}d
                    </button>
                  ))}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  marginTop: '6px'
                }}>
                  Transfer will expire in {expiryDays} {expiryDays === 1 ? 'day' : 'days'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setCurrentStep('upload')}
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: 'white',
                    color: '#6b7280',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ← Back
                </button>
                <button
                  onClick={handleCreateTransfer}
                  style={{
                    flex: 2,
                    padding: '14px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Create Transfer →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Email Notification */}
          {currentStep === 'email' && (
            <div>
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

              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '12px',
                textAlign: 'center'
              }}>
                Notify Recipients
              </h2>

              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                lineHeight: '1.6',
                marginBottom: '32px',
                textAlign: 'center'
              }}>
                Send email notifications with the transfer link (optional)
              </p>

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

              <div style={{ marginBottom: '32px' }}>
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

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={skipEmail}
                  disabled={sendingEmail}
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: 'white',
                    color: '#6b7280',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: sendingEmail ? 'not-allowed' : 'pointer'
                  }}
                >
                  Skip
                </button>
                <button
                  onClick={sendEmailNotification}
                  disabled={sendingEmail || !emailRecipients.trim()}
                  style={{
                    flex: 2,
                    padding: '14px',
                    backgroundColor: sendingEmail || !emailRecipients.trim() ? '#9ca3af' : '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: sendingEmail || !emailRecipients.trim() ? 'not-allowed' : 'pointer'
                  }}
                >
                  {sendingEmail ? 'Sending...' : 'Send & Continue →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

