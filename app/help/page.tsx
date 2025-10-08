'use client';

import { useState } from 'react';
import Link from 'next/link';

interface HelpSection {
  id: string;
  title: string;
  icon: string;
  content: React.ReactNode;
}

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState<string>('getting-started');

  const sections: HelpSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: '🚀',
      content: (
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1f2937', marginBottom: 20 }}>
            Getting Started with SendItFast
          </h2>
          
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
              1. Create an Account
            </h3>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, marginBottom: 16 }}>
              Sign up for a free account to start sending files. You can use email/password or sign in with Google.
            </p>
            <ul style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, paddingLeft: 20 }}>
              <li>Go to the Sign Up page</li>
              <li>Enter your email and create a password</li>
              <li>Verify your email address</li>
              <li>You're ready to send files!</li>
            </ul>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
              2. Upload Your Files
            </h3>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, marginBottom: 16 }}>
              Uploading files is quick and easy:
            </p>
            <ul style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, paddingLeft: 20 }}>
              <li>Click "Send Files" from your dashboard</li>
              <li>Drag and drop files or click to browse</li>
              <li>Add multiple files (up to your plan limit)</li>
              <li>Click "Upload All" to start the upload</li>
              <li>Wait for the upload to complete</li>
            </ul>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
              3. Share Your Files
            </h3>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, marginBottom: 16 }}>
              Once uploaded, you can share your files:
            </p>
            <ul style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, paddingLeft: 20 }}>
              <li>Copy the share link and send it manually</li>
              <li>Or send email notifications directly from SendItFast (Pro/Business)</li>
              <li>Add an optional password for extra security (Pro/Business)</li>
              <li>Include a personal message with your transfer</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'sending-files',
      title: 'Sending Files',
      icon: '📤',
      content: (
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1f2937', marginBottom: 20 }}>
            How to Send Files
          </h2>

          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
              Step-by-Step Guide
            </h3>
            <div style={{ background: '#f9fafb', padding: 20, borderRadius: 8, marginBottom: 16 }}>
              <p style={{ fontSize: 15, color: '#374151', fontWeight: 600, marginBottom: 8 }}>
                Step 1: Prepare Your Files
              </p>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
                Make sure your files are ready and within your plan's size limit. You can send multiple files in one transfer.
              </p>
            </div>

            <div style={{ background: '#f9fafb', padding: 20, borderRadius: 8, marginBottom: 16 }}>
              <p style={{ fontSize: 15, color: '#374151', fontWeight: 600, marginBottom: 8 }}>
                Step 2: Upload Files
              </p>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
                Click "Send Files", then drag and drop your files or click to browse. You'll see a progress bar for each file.
              </p>
            </div>

            <div style={{ background: '#f9fafb', padding: 20, borderRadius: 8, marginBottom: 16 }}>
              <p style={{ fontSize: 15, color: '#374151', fontWeight: 600, marginBottom: 8 }}>
                Step 3: Configure Settings (Optional)
              </p>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
                Pro and Business users can add password protection and customize expiration dates.
              </p>
            </div>

            <div style={{ background: '#f9fafb', padding: 20, borderRadius: 8, marginBottom: 16 }}>
              <p style={{ fontSize: 15, color: '#374151', fontWeight: 600, marginBottom: 8 }}>
                Step 4: Share the Link
              </p>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
                Copy the share link or send email notifications to recipients. They'll receive a link to download your files.
              </p>
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
              Tips for Large Files
            </h3>
            <ul style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, paddingLeft: 20 }}>
              <li>Use a stable internet connection</li>
              <li>Don't close the browser tab during upload</li>
              <li>Upload during off-peak hours for faster speeds</li>
              <li>Consider upgrading for larger file limits</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'receiving-files',
      title: 'Receiving Files',
      icon: '📥',
      content: (
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1f2937', marginBottom: 20 }}>
            How to Receive Files
          </h2>

          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
              Downloading Files
            </h3>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, marginBottom: 16 }}>
              Receiving files is simple - no account required!
            </p>
            <ol style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, paddingLeft: 20 }}>
              <li>Click the share link you received</li>
              <li>Enter the password if one was set</li>
              <li>View the list of files available</li>
              <li>Click "Download" on individual files or "Download All"</li>
              <li>Files will be saved to your Downloads folder</li>
            </ol>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
              Troubleshooting Downloads
            </h3>
            <div style={{ background: '#fef3c7', padding: 16, borderRadius: 8, marginBottom: 12 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#92400e', marginBottom: 8 }}>
                ⚠️ Link Expired
              </p>
              <p style={{ fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
                If the link has expired, contact the sender to request a new transfer.
              </p>
            </div>

            <div style={{ background: '#fef3c7', padding: 16, borderRadius: 8, marginBottom: 12 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#92400e', marginBottom: 8 }}>
                ⚠️ Download Failed
              </p>
              <p style={{ fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
                Check your internet connection and try again. Make sure you have enough storage space.
              </p>
            </div>

            <div style={{ background: '#fef3c7', padding: 16, borderRadius: 8 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#92400e', marginBottom: 8 }}>
                ⚠️ Password Required
              </p>
              <p style={{ fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
                If you don't have the password, contact the sender who shared the files with you.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      icon: '🔒',
      content: (
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1f2937', marginBottom: 20 }}>
            Security & Privacy
          </h2>

          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
              How We Keep Your Files Safe
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
              <div style={{ background: '#f0f9ff', padding: 20, borderRadius: 8, border: '2px solid #0ea5e9' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🔐</div>
                <h4 style={{ fontSize: 16, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>
                  Encryption
                </h4>
                <p style={{ fontSize: 13, color: '#0369a1', lineHeight: 1.6 }}>
                  All files are encrypted during transfer using HTTPS/TLS encryption.
                </p>
              </div>

              <div style={{ background: '#f0fdf4', padding: 20, borderRadius: 8, border: '2px solid #10b981' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>☁️</div>
                <h4 style={{ fontSize: 16, fontWeight: 600, color: '#064e3b', marginBottom: 8 }}>
                  Secure Storage
                </h4>
                <p style={{ fontSize: 13, color: '#065f46', lineHeight: 1.6 }}>
                  Files are stored on Backblaze B2 with enterprise-grade security.
                </p>
              </div>

              <div style={{ background: '#fef3c7', padding: 20, borderRadius: 8, border: '2px solid #f59e0b' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🔑</div>
                <h4 style={{ fontSize: 16, fontWeight: 600, color: '#78350f', marginBottom: 8 }}>
                  Password Protection
                </h4>
                <p style={{ fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
                  Add passwords to your transfers for an extra layer of security.
                </p>
              </div>

              <div style={{ background: '#fce7f3', padding: 20, borderRadius: 8, border: '2px solid #ec4899' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⏰</div>
                <h4 style={{ fontSize: 16, fontWeight: 600, color: '#831843', marginBottom: 8 }}>
                  Auto-Deletion
                </h4>
                <p style={{ fontSize: 13, color: '#9f1239', lineHeight: 1.6 }}>
                  Files are automatically deleted after expiration for your privacy.
                </p>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
              Privacy Policy
            </h3>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, marginBottom: 12 }}>
              We take your privacy seriously:
            </p>
            <ul style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, paddingLeft: 20 }}>
              <li>We never access or view your files</li>
              <li>Files are only accessible via unique share links</li>
              <li>We don't sell or share your data with third parties</li>
              <li>Files are permanently deleted after expiration</li>
              <li>You can delete transfers at any time</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'plans',
      title: 'Plans & Billing',
      icon: '💳',
      content: (
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1f2937', marginBottom: 20 }}>
            Plans & Billing
          </h2>

          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
              Plan Comparison
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Feature</th>
                    <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Free</th>
                    <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Pro</th>
                    <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Business</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>Max File Size</td>
                    <td style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>10 GB</td>
                    <td style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>100 GB</td>
                    <td style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>250 GB</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>Storage Duration</td>
                    <td style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>7 days</td>
                    <td style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>30 days</td>
                    <td style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>90 days</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>Monthly Transfers</td>
                    <td style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>5</td>
                    <td style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Unlimited</td>
                    <td style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Unlimited</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>Password Protection</td>
                    <td style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>❌</td>
                    <td style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>✅</td>
                    <td style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>✅</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>Email Notifications</td>
                    <td style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>❌</td>
                    <td style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>✅</td>
                    <td style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>✅</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>Analytics</td>
                    <td style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>❌</td>
                    <td style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>❌</td>
                    <td style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>✅</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>Team Management</td>
                    <td style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>❌</td>
                    <td style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>❌</td>
                    <td style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>✅ (5 seats)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>API Access</td>
                    <td style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>❌</td>
                    <td style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>❌</td>
                    <td style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>✅</td>
                  </tr>
                  <tr style={{ background: '#f9fafb', fontWeight: 600 }}>
                    <td style={{ padding: 12 }}>Price</td>
                    <td style={{ padding: 12, textAlign: 'center', color: '#0ea5e9' }}>Free</td>
                    <td style={{ padding: 12, textAlign: 'center', color: '#667eea' }}>$9.99/mo</td>
                    <td style={{ padding: 12, textAlign: 'center', color: '#f59e0b' }}>$29.99/mo</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
              Billing Information
            </h3>
            <ul style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, paddingLeft: 20 }}>
              <li>All paid plans are billed monthly</li>
              <li>You can upgrade or downgrade at any time</li>
              <li>Changes take effect immediately</li>
              <li>We accept all major credit cards</li>
              <li>Cancel anytime - no long-term contracts</li>
            </ul>
          </div>

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link
              href="/pricing"
              style={{
                display: 'inline-block',
                padding: '14px 32px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
            >
              View Pricing Plans
            </Link>
          </div>
        </div>
      )
    },
    {
      id: 'business',
      title: 'Business Features',
      icon: '👑',
      content: (
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1f2937', marginBottom: 20 }}>
            Business Plan Features
          </h2>

          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
              Team Management
            </h3>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, marginBottom: 16 }}>
              Collaborate with your team:
            </p>
            <ul style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, paddingLeft: 20 }}>
              <li>Invite up to 5 team members</li>
              <li>Assign roles (Member or Admin)</li>
              <li>Share transfers within your team</li>
              <li>Track team activity</li>
            </ul>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
              API Access
            </h3>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, marginBottom: 16 }}>
              Integrate SendItFast into your applications:
            </p>
            <ul style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, paddingLeft: 20 }}>
              <li>Generate API keys</li>
              <li>Programmatic file transfers</li>
              <li>Automate workflows</li>
              <li>Complete API documentation</li>
            </ul>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
              Analytics Dashboard
            </h3>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, marginBottom: 16 }}>
              Track your file transfer activity:
            </p>
            <ul style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, paddingLeft: 20 }}>
              <li>Total transfers and downloads</li>
              <li>Storage usage statistics</li>
              <li>Monthly activity charts</li>
              <li>Top files by downloads</li>
              <li>Recent activity feed</li>
            </ul>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
              Custom Branding
            </h3>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, marginBottom: 16 }}>
              Make SendItFast your own:
            </p>
            <ul style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, paddingLeft: 20 }}>
              <li>Upload your company logo</li>
              <li>Customize brand colors</li>
              <li>Set company name</li>
              <li>Configure custom domain</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const activeContent = sections.find(s => s.id === activeSection);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: 40
        }}>
          <h1 style={{
            fontSize: 42,
            fontWeight: 700,
            color: 'white',
            margin: '0 0 16px 0'
          }}>
            📚 Help Center
          </h1>
          <p style={{
            fontSize: 18,
            color: 'rgba(255, 255, 255, 0.9)',
            margin: '0 0 32px 0'
          }}>
            Everything you need to know about using SendItFast
          </p>

          {/* Quick Links */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                background: 'white',
                color: '#667eea',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
            >
              ← Home
            </Link>
            <Link
              href="/faq"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '2px solid white',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              FAQ
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
          {/* Sidebar */}
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 20,
            height: 'fit-content',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            position: 'sticky',
            top: 20
          }}>
            <h3 style={{
              fontSize: 14,
              fontWeight: 700,
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: 16
            }}>
              Topics
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  style={{
                    padding: '12px 16px',
                    background: activeSection === section.id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                    color: activeSection === section.id ? 'white' : '#6b7280',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: 20 }}>{section.icon}</span>
                  {section.title}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 40,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            minHeight: 600
          }}>
            {activeContent?.content}
          </div>
        </div>

        {/* Contact Support */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 32,
          marginTop: 24,
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
          <h2 style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#1f2937',
            marginBottom: 12
          }}>
            Need More Help?
          </h2>
          <p style={{
            fontSize: 15,
            color: '#6b7280',
            marginBottom: 24
          }}>
            Can't find what you're looking for? Check our FAQ or get in touch!
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/faq"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
            >
              View FAQ
            </Link>
            <Link
              href="/pricing"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: '#f3f4f6',
                color: '#667eea',
                border: '2px solid #667eea',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              View Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
