'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{
            fontSize: 42,
            fontWeight: 700,
            color: 'white',
            margin: '0 0 16px 0'
          }}>
            Legal & Privacy
          </h1>
          <p style={{
            fontSize: 18,
            color: 'rgba(255, 255, 255, 0.9)',
            margin: '0 0 32px 0'
          }}>
            Our commitment to transparency and your rights
          </p>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: 'white',
              color: '#667eea',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
          >
            ← Back to Home
          </Link>
        </div>

        {/* Tabs */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          gap: 12,
          justifyContent: 'center'
        }}>
          <button
            onClick={() => setActiveTab('terms')}
            style={{
              padding: '12px 32px',
              background: activeTab === 'terms' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f3f4f6',
              color: activeTab === 'terms' ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Terms of Service
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            style={{
              padding: '12px 32px',
              background: activeTab === 'privacy' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f3f4f6',
              color: activeTab === 'privacy' ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Privacy Policy
          </button>
        </div>

        {/* Content */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 40,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          {activeTab === 'terms' ? (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1f2937', marginBottom: 12 }}>
                Terms of Service
              </h2>
              <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 32 }}>
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.8 }}>
                <h3 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
                  1. Acceptance of Terms
                </h3>
                <p style={{ marginBottom: 16 }}>
                  By accessing and using SendItFast ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
                </p>

                <h3 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
                  2. Description of Service
                </h3>
                <p style={{ marginBottom: 16 }}>
                  SendItFast provides a file transfer and sharing service that allows users to upload, store, and share files with others. The Service is provided "as is" and we reserve the right to modify, suspend, or discontinue the Service at any time.
                </p>

                <h3 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
                  3. User Accounts
                </h3>
                <p style={{ marginBottom: 16 }}>
                  To use certain features of the Service, you must register for an account. You are responsible for:
                </p>
                <ul style={{ marginBottom: 16, paddingLeft: 20 }}>
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized access</li>
                  <li>Providing accurate and complete information</li>
                </ul>

                <h3 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
                  4. Acceptable Use
                </h3>
                <p style={{ marginBottom: 16 }}>
                  You agree NOT to use the Service to:
                </p>
                <ul style={{ marginBottom: 16, paddingLeft: 20 }}>
                  <li>Upload or share illegal, harmful, or offensive content</li>
                  <li>Violate any intellectual property rights</li>
                  <li>Transmit viruses, malware, or malicious code</li>
                  <li>Harass, abuse, or harm others</li>
                  <li>Spam or send unsolicited communications</li>
                  <li>Attempt to gain unauthorized access to the Service</li>
                  <li>Use the Service for any illegal purpose</li>
                </ul>

                <h3 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
                  5. Content and Intellectual Property
                </h3>
                <p style={{ marginBottom: 16 }}>
                  You retain all rights to the files you upload. By using the Service, you grant us a limited license to store, process, and transmit your files solely for the purpose of providing the Service. We do not claim ownership of your content.
                </p>

                <h3 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
                  6. File Storage and Deletion
                </h3>
                <p style={{ marginBottom: 16 }}>
                  Files are stored for the duration specified by your plan (7, 30, or 90 days). After expiration, files are permanently deleted and cannot be recovered. You may delete your files at any time before expiration.
                </p>

                <h3 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
                  7. Payment and Subscriptions
                </h3>
                <p style={{ marginBottom: 16 }}>
                  Paid plans are billed monthly. You may cancel at any time, and cancellation will take effect at the end of your current billing period. We do not provide refunds for partial months.
                </p>

                <h3 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
                  8. Limitation of Liability
                </h3>
                <p style={{ marginBottom: 16 }}>
                  SendItFast is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the Service, including but not limited to data loss, service interruptions, or unauthorized access to your files.
                </p>

                <h3 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
                  9. Termination
                </h3>
                <p style={{ marginBottom: 16 }}>
                  We reserve the right to terminate or suspend your account at any time for violations of these Terms of Service. Upon termination, your files will be deleted according to our standard deletion policy.
                </p>

                <h3 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
                  10. Changes to Terms
                </h3>
                <p style={{ marginBottom: 16 }}>
                  We may update these Terms of Service from time to time. We will notify you of significant changes by email or through the Service. Continued use of the Service after changes constitutes acceptance of the new terms.
                </p>

                <h3 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
                  11. Contact Us
                </h3>
                <p style={{ marginBottom: 0 }}>
                  If you have questions about these Terms of Service, please contact us through our support channels.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1f2937', marginBottom: 12 }}>
                Privacy Policy
              </h2>
              <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 32 }}>
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.8 }}>
                <h3 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
                  1. Information We Collect
                </h3>
                <p style={{ marginBottom: 16 }}>
                  We collect the following types of information:
                </p>
                <ul style={{ marginBottom: 16, paddingLeft: 20 }}>
                  <li><strong>Account Information:</strong> Email address, name, and password</li>
                  <li><strong>File Metadata:</strong> File names, sizes, upload dates, and expiration dates</li>
                  <li><strong>Usage Data:</strong> IP addresses, browser type, access times, and pages viewed</li>
                  <li><strong>Payment Information:</strong> Processed securely through our payment provider (we do not store credit card details)</li>
                </ul>

                <h3 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
                  2. How We Use Your Information
                </h3>
                <p style={{ marginBottom: 16 }}>
                  We use your information to:
                </p>
                <ul style={{ marginBottom: 16, paddingLeft: 20 }}>
                  <li>Provide and maintain the Service</li>
                  <li>Process your transactions and manage your account</li>
                  <li>Send you service-related notifications</li>
                  <li>Improve and optimize the Service</li>
                  <li>Prevent fraud and abuse</li>
                  <li>Comply with legal obligations</li>
                </ul>

                <h3 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
                  3. Your Files and Content
                </h3>
                <p style={{ marginBottom: 16 }}>
                  We take your privacy seriously:
                </p>
                <ul style={{ marginBottom: 16, paddingLeft: 20 }}>
                  <li>We do NOT access, view, or scan your files</li>
                  <li>Your files are encrypted during transmission using TLS/SSL</li>
                  <li>Files are stored securely on enterprise-grade cloud storage</li>
                  <li>Files are automatically deleted after expiration</li>
                  <li>You can delete your files at any time</li>
                </ul>

                <h3 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
                  4. Information Sharing
                </h3>
                <p style={{ marginBottom: 16 }}>
                  We do NOT sell your personal information. We may share information with:
                </p>
                <ul style={{ marginBottom: 16, paddingLeft: 20 }}>
                  <li><strong>Service Providers:</strong> Third-party services that help us operate (cloud storage, payment processing, email delivery)</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In the event of a merger or acquisition</li>
                </ul>

                <h3 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
                  5. Data Security
                </h3>
                <p style={{ marginBottom: 16 }}>
                  We implement industry-standard security measures:
                </p>
                <ul style={{ marginBottom: 16, paddingLeft: 20 }}>
                  <li>TLS/SSL encryption for data in transit</li>
                  <li>Secure password hashing with bcrypt</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and monitoring</li>
                  <li>Automatic file deletion after expiration</li>
                </ul>

                <h3 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
                  6. Your Rights
                </h3>
                <p style={{ marginBottom: 16 }}>
                  You have the right to:
                </p>
                <ul style={{ marginBottom: 16, paddingLeft: 20 }}>
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and data</li>
                  <li>Export your data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Object to data processing</li>
                </ul>

                <h3 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
                  7. Cookies and Tracking
                </h3>
                <p style={{ marginBottom: 16 }}>
                  We use cookies and similar technologies to:
                </p>
                <ul style={{ marginBottom: 16, paddingLeft: 20 }}>
                  <li>Maintain your session and keep you logged in</li>
                  <li>Remember your preferences</li>
                  <li>Analyze usage patterns and improve the Service</li>
                  <li>Prevent fraud and abuse</li>
                </ul>

                <h3 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
                  8. Data Retention
                </h3>
                <p style={{ marginBottom: 16 }}>
                  We retain your data as follows:
                </p>
                <ul style={{ marginBottom: 16, paddingLeft: 20 }}>
                  <li><strong>Files:</strong> Deleted automatically after expiration (7, 30, or 90 days)</li>
                  <li><strong>Account Data:</strong> Retained while your account is active</li>
                  <li><strong>Usage Logs:</strong> Retained for 90 days for security and analytics</li>
                  <li><strong>Deleted Account Data:</strong> Permanently deleted within 30 days</li>
                </ul>

                <h3 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
                  9. International Data Transfers
                </h3>
                <p style={{ marginBottom: 16 }}>
                  Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
                </p>

                <h3 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
                  10. Children's Privacy
                </h3>
                <p style={{ marginBottom: 16 }}>
                  Our Service is not intended for children under 13. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
                </p>

                <h3 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
                  11. Changes to Privacy Policy
                </h3>
                <p style={{ marginBottom: 16 }}>
                  We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through the Service. Your continued use after changes constitutes acceptance.
                </p>

                <h3 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
                  12. GDPR Compliance
                </h3>
                <p style={{ marginBottom: 16 }}>
                  We are committed to GDPR compliance. If you are an EU resident, you have additional rights:
                </p>
                <ul style={{ marginBottom: 16, paddingLeft: 20 }}>
                  <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Right to Rectification:</strong> Correct inaccurate data</li>
                  <li><strong>Right to Erasure:</strong> Request deletion of your data</li>
                  <li><strong>Right to Data Portability:</strong> Export your data in machine-readable format</li>
                  <li><strong>Right to Object:</strong> Object to certain data processing</li>
                  <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                </ul>
                <p style={{ marginBottom: 16 }}>
                  To exercise these rights, visit your <Link href="/privacy" style={{ color: '#667eea', fontWeight: 600 }}>Privacy Settings</Link> page or contact us.
                </p>

                <h3 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
                  13. Contact Us
                </h3>
                <p style={{ marginBottom: 0 }}>
                  If you have questions about this Privacy Policy or want to exercise your rights, please contact us through our support channels or visit your <Link href="/privacy" style={{ color: '#667eea', fontWeight: 600 }}>Privacy Settings</Link> page.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 32,
          marginTop: 24,
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{
            fontSize: 20,
            fontWeight: 600,
            color: '#1f2937',
            marginBottom: 20
          }}>
            Need More Information?
          </h3>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/faq"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                background: '#f3f4f6',
                color: '#667eea',
                border: '2px solid #667eea',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              FAQ
            </Link>
            <Link
              href="/help"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                background: '#f3f4f6',
                color: '#667eea',
                border: '2px solid #667eea',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Help Center
            </Link>
            <Link
              href="/about"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                background: '#f3f4f6',
                color: '#667eea',
                border: '2px solid #667eea',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              About Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
