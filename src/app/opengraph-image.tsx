import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'TaskFlow AI - AI-Powered Project Management';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)',
          position: 'relative',
        }}
      >
        {/* Background pattern - dots */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 2px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 32,
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 20,
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 24,
              }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="15" cy="15" r="5" fill="white" />
                <circle cx="24" cy="24" r="6" fill="white" />
                <circle cx="33" cy="33" r="5" fill="white" />
                <circle cx="33" cy="15" r="3" fill="white" />
                <circle cx="15" cy="33" r="3" fill="white" />
              </svg>
            </div>
            <span
              style={{
                fontSize: 64,
                fontWeight: 'bold',
                color: 'white',
                letterSpacing: -2,
              }}
            >
              TaskFlow AI
            </span>
          </div>

          {/* Tagline */}
          <p
            style={{
              fontSize: 32,
              color: 'rgba(255, 255, 255, 0.9)',
              marginTop: 8,
              fontWeight: 500,
            }}
          >
            AI-Powered Project Management
          </p>

          {/* Features row */}
          <div
            style={{
              display: 'flex',
              gap: 32,
              marginTop: 48,
            }}
          >
            {['Smart Tickets', 'AI Reviews', 'Team Insights'].map((feature) => (
              <div
                key={feature}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 24px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: 100,
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  style={{
                    fontSize: 18,
                    color: 'white',
                    fontWeight: 500,
                  }}
                >
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
