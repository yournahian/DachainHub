import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

/**
 * POST /api/upload
 * Uploads files to Vercel Blob, falling back to local files in development if token is missing,
 * with a 4.5 MB file size limit check.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Enforce 4.5 MB maximum file size limit (Vercel Blob Hobby plan limit)
    const MAX_SIZE = 4.5 * 1024 * 1024; // 4.5 MB in bytes
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds the 4.5 MB limit' },
        { status: 400 }
      );
    }

    // Fallback to local uploads if token is not configured (e.g., local development)
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.log('[Upload Fallback] BLOB_READ_WRITE_TOKEN is missing. Saving file locally...');
      
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filename = `upload_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const publicDirectory = join(process.cwd(), 'public', 'uploads');
      
      // Ensure the directory exists
      await mkdir(publicDirectory, { recursive: true });
      
      const filePath = join(publicDirectory, filename);
      await writeFile(filePath, buffer);
      
      const fileUrl = `/uploads/${filename}`;
      return NextResponse.json({ success: true, url: fileUrl });
    }

    // Upload directly to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
    });

    return NextResponse.json({ success: true, url: blob.url });
  } catch (error) {
    console.error('[Uploader] Upload failed:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
