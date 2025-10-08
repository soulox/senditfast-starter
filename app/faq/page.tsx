'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  // Getting Started
  {
    category: 'Getting Started',
    question: 'What is SendItFast?',
    answer: 'SendItFast is a secure, fast file transfer service that lets you send large files up to 250 GB. Simply upload your files, get a shareable link, and send it to anyone. No registration required for recipients!'
  },
  {
    category: 'Getting Started',
    question: 'Do I need an account to use SendItFast?',
    answer: 'You need an account to send files, but recipients can download files without creating an account. Just share the link and they can access the files immediately.'
  },
  {
    category: 'Getting Started',
    question: 'How do I send files?',
    answer: 'Sign in, click "Send Files", drag and drop your files or click to browse, then click "Upload All". Once uploaded, you\'ll get a shareable link that you can send via email or copy to share.'
  },

  // File Limits & Storage
  {
    category: 'File Limits & Storage',
    question: 'What is the maximum file size I can send?',
    answer: 'File size limits depend on your plan: Free (10 GB), Pro (100 GB), and Business (250 GB) per transfer. You can send multiple files in a single transfer.'
  },
  {
    category: 'File Limits & Storage',
    question: 'How long are files stored?',
    answer: 'Storage duration depends on your plan: Free (7 days), Pro (30 days), and Business (90 days). Files are automatically deleted after expiration.'
  },
  {
    category: 'File Limits & Storage',
    question: 'How many transfers can I create?',
    answer: 'Free plan users can create 5 transfers per month. Pro and Business plan users have unlimited transfers.'
  },
  {
    category: 'File Limits & Storage',
    question: 'What file types are supported?',
    answer: 'All file types are supported! You can send documents, images, videos, archives, and any other file format.'
  },

  // Security & Privacy
  {
    category: 'Security & Privacy',
    question: 'Are my files secure?',
    answer: 'Yes! All files are encrypted during transfer using HTTPS/TLS. Files are stored securely with enterprise-grade security.'
  },
  {
    category: 'Security & Privacy',
    question: 'Can I password-protect my transfers?',
    answer: 'Yes! Pro and Business plan users can add password protection to their transfers. Recipients will need to enter the password to download files.'
  },
  {
    category: 'Security & Privacy',
    question: 'Who can access my files?',
    answer: 'Only people with the unique share link can access your files. If you add password protection, they\'ll also need the password. Files are never publicly listed.'
  },
  {
    category: 'Security & Privacy',
    question: 'What happens to my files after expiration?',
    answer: 'Files are automatically and permanently deleted from our servers after the expiration date. We cannot recover expired files.'
  },

  // Plans & Pricing
  {
    category: 'Plans & Pricing',
    question: 'What plans are available?',
    answer: 'We offer three plans: Free (10 GB, 7 days, 5 transfers/month), Pro ($9.99/month - 100 GB, 30 days, unlimited), and Business ($29.99/month - 250 GB, 90 days, unlimited with team features).'
  },
  {
    category: 'Plans & Pricing',
    question: 'Can I upgrade or downgrade my plan?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time from your account settings. Changes take effect immediately.'
  },
  {
    category: 'Plans & Pricing',
    question: 'Is there a free trial for paid plans?',
    answer: 'The Free plan is available indefinitely. You can test all features with the Free plan before upgrading to Pro or Business.'
  },
  {
    category: 'Plans & Pricing',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure payment processor, Authorize.Net.'
  },

  // Features
  {
    category: 'Features',
    question: 'Can I send files to multiple people?',
    answer: 'Yes! You can send email notifications to multiple recipients at once. Each recipient gets the same download link.'
  },
  {
    category: 'Features',
    question: 'Do you offer email notifications?',
    answer: 'Yes! Pro and Business plan users can send email notifications to recipients with a direct download link and file details.'
  },
  {
    category: 'Features',
    question: 'What are Business plan team features?',
    answer: 'Business plan includes: team management (5 seats), API access for integrations, custom branding, analytics dashboard, and audit logs.'
  },
  {
    category: 'Features',
    question: 'Can I track who downloaded my files?',
    answer: 'Business plan users get access to detailed analytics showing download activity, recipient engagement, and transfer statistics.'
  },

  // Technical
  {
    category: 'Technical',
    question: 'What browsers are supported?',
    answer: 'SendItFast works on all modern browsers: Chrome, Firefox, Safari, Edge, and Opera. We recommend using the latest version for the best experience.'
  },
  {
    category: 'Technical',
    question: 'Can I use SendItFast on mobile?',
    answer: 'Yes! SendItFast is fully responsive and works on mobile devices. You can upload and download files from your phone or tablet.'
  },
  {
    category: 'Technical',
    question: 'Do you have an API?',
    answer: 'Yes! Business plan users get API access for programmatic file transfers. Check our API documentation for integration details.'
  },
  {
    category: 'Technical',
    question: 'What happens if my upload is interrupted?',
    answer: 'If your upload is interrupted, you\'ll need to restart it. We recommend using a stable internet connection for large file uploads.'
  },

  // Troubleshooting
  {
    category: 'Troubleshooting',
    question: 'Why is my upload slow?',
    answer: 'Upload speed depends on your internet connection. Large files take longer to upload. Make sure you have a stable connection and try closing other bandwidth-intensive applications.'
  },
  {
    category: 'Troubleshooting',
    question: 'I can\'t download a file. What should I do?',
    answer: 'Check if the link has expired or if password protection is enabled. Make sure you\'re using a supported browser. If issues persist, contact the sender.'
  },
  {
    category: 'Troubleshooting',
    question: 'How do I delete a transfer?',
    answer: 'Go to your Dashboard, find the transfer you want to delete, and click the "Delete" button. This will permanently remove the files from our servers.'
  },
  {
    category: 'Troubleshooting',
    question: 'I forgot my password. How do I reset it?',
    answer: 'Click "Forgot Password" on the sign-in page and follow the instructions to reset your password via email.'
  }
];

const categories = Array.from(new Set(faqs.map(faq => faq.category)));

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredFAQs = selectedCategory === 'All' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
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
            ❓ Frequently Asked Questions
          </h1>
          <p style={{
            fontSize: 18,
            color: 'rgba(255, 255, 255, 0.9)',
            margin: '0 0 32px 0'
          }}>
            Find answers to common questions about SendItFast
          </p>

          {/* Back to Home */}
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

        {/* Category Filter */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => setSelectedCategory('All')}
              style={{
                padding: '8px 16px',
                background: selectedCategory === 'All' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f3f4f6',
                color: selectedCategory === 'All' ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: '8px 16px',
                  background: selectedCategory === category ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f3f4f6',
                  color: selectedCategory === category ? 'white' : '#6b7280',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          {filteredFAQs.map((faq, index) => (
            <div
              key={index}
              style={{
                borderBottom: index < filteredFAQs.length - 1 ? '1px solid #e5e7eb' : 'none',
                paddingBottom: 16,
                marginBottom: 16
              }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ flex: 1, paddingRight: 16 }}>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#667eea',
                    marginBottom: 6,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {faq.category}
                  </div>
                  <div style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#1f2937'
                  }}>
                    {faq.question}
                  </div>
                </div>
                <div style={{
                  fontSize: 24,
                  color: '#667eea',
                  transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }}>
                  ▼
                </div>
              </button>

              {openIndex === index && (
                <div style={{
                  padding: '16px 0 0 0',
                  fontSize: 15,
                  color: '#6b7280',
                  lineHeight: 1.7,
                  animation: 'fadeIn 0.2s ease-in'
                }}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
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
            Still have questions?
          </h2>
          <p style={{
            fontSize: 15,
            color: '#6b7280',
            marginBottom: 24
          }}>
            Can't find the answer you're looking for? Our support team is here to help!
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/pricing"
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
              View Plans
            </Link>
            <Link
              href="/auth/signin"
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
              Sign In
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
