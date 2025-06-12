// app/api/create-post/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const data = await req.json();
    console.log('Incoming post data:', data);

    const res = await fetch('http://localhost:8000/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
  
    const body = await res.json();
    return NextResponse.json(body, { status: res.status });
}
