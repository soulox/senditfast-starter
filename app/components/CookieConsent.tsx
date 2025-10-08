'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, can't be disabled
    functional: true,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(consent);
        setPreferences(saved);
      } catch (e) {
        // Invalid JSON, show banner
        setShowBanner(true);
      }
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true
    };
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted));
    setPreferences(allAccepted);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    };
    localStorage.setItem('cookieConsent', JSON.stringify(necessaryOnly));
    setPreferences(necessaryOnly);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const savePreferences = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    setShowBanner(false);
    setShowPreferences(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
        padding: '24px',
        zIndex: 9999,
        animation: 'slideUp 0.3s ease-out'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            flexWrap: 'wrap'
          }}>
            {/* Icon */}
            <div style={{ fontSize: 40 }}>🍪</div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 300 }}>
              <h3 style={{
                fontSize: 18,
                fontWeight: 700,
                color: '#1f2937',
                margin: '0 0 8px 0'
              }}>
                We value your privacy
              </h3>
              <p style={{
                fontSize: 14,
                color: '#6b7280',
                lineHeight: 1.6,
                margin: 0
              }}>
                We use cookies to enhance your experience, analyze site usage, and provide personalized content. 
                By clicking "Accept All", you consent to our use of cookies. {' '}
                <Link
                  href="/legal"
                  style={{
                    color: '#667eea',
                    textDecoration: 'underline',
                    fontWeight: 600
                  }}
                >
                  Learn more
                </Link>
              </p>
            </div>

            {/* Buttons */}
            <div style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setShowPreferences(true)}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Customize
              </button>
              <button
                onClick={acceptNecessary}
                style={{
                  padding: '10px 20px',
                  background: 'white',
                  color: '#667eea',
                  border: '2px solid #667eea',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Necessary Only
              </button>
              <button
                onClick={acceptAll}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  whiteSpace: 'nowrap'
                }}
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      {showPreferences && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: 20
        }}>
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: 32,
            maxWidth: 600,
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <h2 style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#1f2937',
              marginBottom: 20
            }}>
              Cookie Preferences
            </h2>

            <p style={{
              fontSize: 14,
              color: '#6b7280',
              lineHeight: 1.6,
              marginBottom: 24
            }}>
              We use different types of cookies to optimize your experience. You can choose which categories to allow.
            </p>

            {/* Necessary Cookies */}
            <div style={{
              padding: 16,
              background: '#f9fafb',
              borderRadius: 8,
              marginBottom: 16
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8
              }}>
                <h3 style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#1f2937',
                  margin: 0
                }}>
                  Necessary Cookies
                </h3>
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#6b7280',
                  background: '#e5e7eb',
                  padding: '4px 8px',
                  borderRadius: 4
                }}>
                  Always Active
                </span>
              </div>
              <p style={{
                fontSize: 13,
                color: '#6b7280',
                lineHeight: 1.5,
                margin: 0
              }}>
                Required for the website to function. These cookies enable core functionality like authentication and security.
              </p>
            </div>

            {/* Functional Cookies */}
            <div style={{
              padding: 16,
              background: '#f9fafb',
              borderRadius: 8,
              marginBottom: 16
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8
              }}>
                <h3 style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#1f2937',
                  margin: 0
                }}>
                  Functional Cookies
                </h3>
                <label style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={preferences.functional}
                    onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                    style={{ cursor: 'pointer', width: 18, height: 18 }}
                  />
                </label>
              </div>
              <p style={{
                fontSize: 13,
                color: '#6b7280',
                lineHeight: 1.5,
                margin: 0
              }}>
                Enable enhanced functionality like remembering your preferences and settings.
              </p>
            </div>

            {/* Analytics Cookies */}
            <div style={{
              padding: 16,
              background: '#f9fafb',
              borderRadius: 8,
              marginBottom: 16
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8
              }}>
                <h3 style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#1f2937',
                  margin: 0
                }}>
                  Analytics Cookies
                </h3>
                <label style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    style={{ cursor: 'pointer', width: 18, height: 18 }}
                  />
                </label>
              </div>
              <p style={{
                fontSize: 13,
                color: '#6b7280',
                lineHeight: 1.5,
                margin: 0
              }}>
                Help us understand how visitors use our site to improve performance and user experience.
              </p>
            </div>

            {/* Marketing Cookies */}
            <div style={{
              padding: 16,
              background: '#f9fafb',
              borderRadius: 8,
              marginBottom: 24
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8
              }}>
                <h3 style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#1f2937',
                  margin: 0
                }}>
                  Marketing Cookies
                </h3>
                <label style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                    style={{ cursor: 'pointer', width: 18, height: 18 }}
                  />
                </label>
              </div>
              <p style={{
                fontSize: 13,
                color: '#6b7280',
                lineHeight: 1.5,
                margin: 0
              }}>
                Used to deliver personalized advertisements and measure campaign effectiveness.
              </p>
            </div>

            {/* Buttons */}
            <div style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowPreferences(false)}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  color: '#6b7280',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={savePreferences}
                style={{
                  padding: '10px 20px',
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
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
