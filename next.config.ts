import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images:{
    remotePatterns:[
      {
        // Google OAuth profile pictures
        protocol:"https",
        hostname:"lh3.googleusercontent.com",
        port:'',
        pathname:"/**"
      },
      {
        // GitHub OAuth profile pictures
        protocol:"https",
        hostname:"avatars.githubusercontent.com",
        port:'',
        pathname:"/**"
      }
    ]
  },
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },
  reactStrictMode:true,
  // /api/template/[id] reads starter template files off disk at request
  // time via fs.readdir/fs.stat. Serverless output tracing only bundles
  // files it can statically detect being imported, so without this the
  // nexide-starters/ folder gets left out of the deployed function and
  // every template request 404s in production (works fine in `next dev`
  // because that runs against the full source tree).
  outputFileTracingIncludes: {
    "/api/template/[id]": ["./nexide-starters/**/*"],
  },
};

export default nextConfig;

