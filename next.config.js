// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Solo necesario en desarrollo
  allowedDevOrigins: [
    'http://10.252.1.26:3000', // la IP desde la que accedes al frontend
    'http://localhost:3000'    // opcional, para mantener soporte local
  ],
}

module.exports = nextConfig;
