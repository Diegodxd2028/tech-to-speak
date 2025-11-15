import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audio = formData.get('audio') as Blob;

    if (!audio) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    const buffer = await audio.arrayBuffer();
    const audioDir = join(process.cwd(), 'public', 'recordings');
    
    await mkdir(audioDir, { recursive: true });

    const filename = `recording-${Date.now()}.webm`;
    const filepath = join(audioDir, filename);

    await writeFile(filepath, Buffer.from(buffer));

    return NextResponse.json(
      { 
        success: true, 
        filename,
        path: `/recordings/${filename}`
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving audio:', error);
    return NextResponse.json(
      { error: 'Error saving audio' },
      { status: 500 }
    );
  }
}