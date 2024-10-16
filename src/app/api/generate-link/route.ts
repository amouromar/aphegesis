import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const { audioUrl } = await request.json();
  const shortId = nanoid(8);
  const shortLink = `${process.env.NEXT_PUBLIC_BASE_URL}/a/${shortId}`;

  try {
    await prisma.audioPost.create({
      data: {
        shortId,
        audioUrl,
      },
    });

    return NextResponse.json({ shortLink });
  } catch (error) {
    console.error('Failed to generate link:', error);
    return NextResponse.json({ error: 'Failed to generate link' }, { status: 500 });
  }
}