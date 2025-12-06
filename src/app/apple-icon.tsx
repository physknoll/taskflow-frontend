import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
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
          borderRadius: '40px',
        }}
      >
        <svg
          width="100"
          height="100"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Sparkles pattern - scaled for apple icon */}
          <circle cx="31" cy="31" r="8" fill="white" />
          <circle cx="50" cy="50" r="10" fill="white" />
          <circle cx="69" cy="69" r="8" fill="white" />
          <circle cx="69" cy="31" r="5" fill="white" />
          <circle cx="31" cy="69" r="5" fill="white" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}


