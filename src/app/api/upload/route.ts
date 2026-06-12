import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * POST /api/upload
 * Receives an image file via multipart/form-data,
 * saves it locally to public/uploads/, and returns the local URL.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert arrayBuffer to Buffer for Node.js fs writing
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create the path for public/uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique file name preserving extension
    const ext = path.extname(file.name) || '.png';
    const filename = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    // Write file to local disk
    fs.writeFileSync(filePath, buffer);

    // Return the local relative URL
    const localUrl = `/uploads/${filename}`;
    return NextResponse.json({ success: true, url: localUrl });
  } catch (error) {
    console.error('[Local Uploader] Upload failed:', error);
    return NextResponse.json({ error: 'Failed to write file to local disk' }, { status: 500 });
  }
}
