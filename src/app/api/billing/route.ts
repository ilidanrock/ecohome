import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({ message: 'Billing API GET endpoint' });
}

export async function POST(request: Request) {
    const body = await request.json();
    return NextResponse.json({ message: 'Billing API POST endpoint', data: body });
}