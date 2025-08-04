import { NextRequest, NextResponse } from 'next/server';

const allowedOrigins = [
  'https://ecohome-two.vercel.app',
  'http://localhost:3000', // útil para desarrollo local
];

export function withCORS(req: NextRequest, res: NextResponse) {
  const origin = req.headers.get('origin') || '';

  const headers = new Headers(res.headers);

  if (allowedOrigins.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Credentials', 'true'); // si necesitas enviar cookies
  }

  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return new NextResponse(res.body, {
    status: res.status,
    headers,
  });
}
