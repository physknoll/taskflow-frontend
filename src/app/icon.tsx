import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #5c7cfa 0%, #f06595 100%)',
          borderRadius: '8px',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Sparkles pattern */}
          <circle cx="10" cy="10" r="3" fill="white" />
          <circle cx="16" cy="16" r="3.5" fill="white" />
          <circle cx="22" cy="22" r="3" fill="white" />
          <circle cx="22" cy="10" r="2" fill="white" />
          <circle cx="10" cy="22" r="2" fill="white" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}



