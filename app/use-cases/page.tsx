'use client';

import Link from 'next/link';

interface UseCase {
  industry: string;
  icon: string;
  title: string;
  description: string;
  scenarios: string[];
  benefits: string[];
  gradient: string;
}

const useCases: UseCase[] = [
  {
    industry: 'Creative & Media',
    icon: '🎨',
    title: 'For Designers, Photographers & Video Editors',
    description: 'Share large creative files with clients and collaborators without compression or quality loss.',
    scenarios: [
      'Send high-resolution photos to clients',
      'Share video project files with editors',
      'Deliver final designs and assets',
      'Collaborate on creative projects',
      'Send RAW files and source materials'
    ],
    benefits: [
      'No file compression - maintain quality',
      'Send up to 250 GB per transfer',
      'Password protection for client files',
      'Track when clients download files'
    ],
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    industry: 'Architecture & Engineering',
    icon: '🏗️',
    title: 'For Architects, Engineers & Contractors',
    description: 'Share CAD files, blueprints, and technical drawings securely with project stakeholders.',
    scenarios: [
      'Send CAD and BIM files to contractors',
      'Share project blueprints with clients',
      'Deliver technical specifications',
      'Collaborate on design revisions',
      'Archive project documentation'
    ],
    benefits: [
      'Handle large technical files easily',
      'Secure file sharing with passwords',
      'Extended storage for long projects',
      'Team collaboration features'
    ],
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    industry: 'Legal & Finance',
    icon: '⚖️',
    title: 'For Law Firms & Financial Institutions',
    description: 'Securely share confidential documents and sensitive financial data with clients and partners.',
    scenarios: [
      'Send legal documents to clients',
      'Share financial reports securely',
      'Deliver audit documentation',
      'Exchange confidential contracts',
      'Archive case files and records'
    ],
    benefits: [
      'Bank-level encryption',
      'Password-protected transfers',
      'Audit logs for compliance',
      'Automatic file expiration'
    ],
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    industry: 'Healthcare',
    icon: '🏥',
    title: 'For Healthcare Providers & Medical Facilities',
    description: 'Share medical imaging, patient records, and research data securely and compliantly.',
    scenarios: [
      'Transfer medical imaging files',
      'Share patient records securely',
      'Collaborate on research data',
      'Send lab results to specialists',
      'Archive medical documentation'
    ],
    benefits: [
      'HIPAA-compliant security',
      'Encrypted file transfers',
      'Access control with passwords',
      'Secure deletion after expiry'
    ],
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  {
    industry: 'Education',
    icon: '🎓',
    title: 'For Schools, Universities & Online Courses',
    description: 'Share course materials, assignments, and educational content with students and faculty.',
    scenarios: [
      'Distribute course materials to students',
      'Collect large assignment submissions',
      'Share research data with colleagues',
      'Deliver video lectures and recordings',
      'Exchange educational resources'
    ],
    benefits: [
      'Easy sharing with multiple recipients',
      'No file size restrictions',
      'Track download activity',
      'Cost-effective for institutions'
    ],
    gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
  },
  {
    industry: 'Real Estate',
    icon: '🏠',
    title: 'For Real Estate Agents & Property Managers',
    description: 'Share property photos, virtual tours, and documentation with buyers and sellers.',
    scenarios: [
      'Send property photos and videos',
      'Share virtual tour files',
      'Deliver inspection reports',
      'Exchange legal documents',
      'Distribute marketing materials'
    ],
    benefits: [
      'High-quality image transfers',
      'Quick sharing with clients',
      'Professional presentation',
      'Mobile-friendly access'
    ],
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  },
  {
    industry: 'Software Development',
    icon: '💻',
    title: 'For Developers & Tech Companies',
    description: 'Share code repositories, builds, and technical documentation with teams and clients.',
    scenarios: [
      'Deliver software builds to clients',
      'Share large code repositories',
      'Distribute installation packages',
      'Exchange technical documentation',
      'Collaborate on development projects'
    ],
    benefits: [
      'API integration available',
      'Team collaboration tools',
      'Version control friendly',
      'Automated workflows'
    ],
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    industry: 'Marketing & Advertising',
    icon: '📢',
    title: 'For Marketing Agencies & Ad Firms',
    description: 'Share campaign assets, media files, and creative materials with clients and partners.',
    scenarios: [
      'Send campaign assets to clients',
      'Share video ads and commercials',
      'Deliver marketing materials',
      'Exchange brand guidelines',
      'Collaborate on creative projects'
    ],
    benefits: [
      'Fast delivery to clients',
      'Custom branding options',
      'Email notifications',
      'Analytics and tracking'
    ],
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
  }
];

export default function UseCasesPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h1 style={{
            fontSize: 48,
            fontWeight: 700,
            color: 'white',
            margin: '0 0 20px 0'
          }}>
            SendItFast for Every Industry
          </h1>
          <p style={{
            fontSize: 20,
            color: 'rgba(255, 255, 255, 0.9)',
            margin: '0 0 32px 0',
            maxWidth: 700,
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Secure, fast file transfers tailored to your industry's unique needs
          </p>
          <Link
            href="/pricing"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              background: 'white',
              color: '#667eea',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              marginRight: 12
            }}
          >
            Get Started
          </Link>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '2px solid white',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            ← Back to Home
          </Link>
        </div>

        {/* Use Cases Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: 24
        }}>
          {useCases.map((useCase, index) => (
            <div
              key={index}
              style={{
                background: 'white',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                transition: 'transform 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Header */}
              <div style={{
                background: useCase.gradient,
                padding: '32px 24px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 64, marginBottom: 12 }}>{useCase.icon}</div>
                <div style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'rgba(255, 255, 255, 0.9)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: 8
                }}>
                  {useCase.industry}
                </div>
                <h2 style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: 'white',
                  margin: 0
                }}>
                  {useCase.title}
                </h2>
              </div>

              {/* Content */}
              <div style={{ padding: 24 }}>
                <p style={{
                  fontSize: 15,
                  color: '#6b7280',
                  lineHeight: 1.7,
                  marginBottom: 24
                }}>
                  {useCase.description}
                </p>

                {/* Scenarios */}
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#374151',
                    marginBottom: 12,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Common Use Cases
                  </h3>
                  <ul style={{
                    fontSize: 14,
                    color: '#6b7280',
                    lineHeight: 1.8,
                    paddingLeft: 20,
                    margin: 0
                  }}>
                    {useCase.scenarios.map((scenario, i) => (
                      <li key={i}>{scenario}</li>
                    ))}
                  </ul>
                </div>

                {/* Benefits */}
                <div>
                  <h3 style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#374151',
                    marginBottom: 12,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Key Benefits
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {useCase.benefits.map((benefit, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: 14,
                          color: '#374151'
                        }}
                      >
                        <span style={{ color: '#10b981', fontSize: 16 }}>✓</span>
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 48,
          marginTop: 48,
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
        }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🚀</div>
          <h2 style={{
            fontSize: 32,
            fontWeight: 700,
            color: '#1f2937',
            marginBottom: 16
          }}>
            Ready to Get Started?
          </h2>
          <p style={{
            fontSize: 18,
            color: '#6b7280',
            marginBottom: 32,
            maxWidth: 600,
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Join thousands of professionals who trust SendItFast for secure, fast file transfers
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/auth/signup"
              style={{
                display: 'inline-block',
                padding: '16px 40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
            >
              Start Free Trial
            </Link>
            <Link
              href="/pricing"
              style={{
                display: 'inline-block',
                padding: '16px 40px',
                background: '#f3f4f6',
                color: '#667eea',
                border: '2px solid #667eea',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
