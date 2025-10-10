import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SendItFast - Secure File Transfer',
    short_name: 'SendItFast',
    description: 'Send large files securely with password protection and analytics',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#667eea',
    orientation: 'portrait-primary',
    categories: ['business', 'productivity', 'utilities'],
  };
}

