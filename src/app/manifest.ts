import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HomeHub OS',
    short_name: 'HomeHub',
    description: 'A premium, calm, and timeless operating system for managing your home.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8F9F7', // Translates loosely to oklch(0.975 0.01 80)
    theme_color: '#282420', // Translates loosely to oklch(0.18 0.03 30)
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
