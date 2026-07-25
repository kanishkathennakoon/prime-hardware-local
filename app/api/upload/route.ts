import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { writeFile, mkdir, rm } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin role required.' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const rawFolder = (formData.get('folder') as string | null) || 'general';

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Sanitize folder slug (allow alphanumeric, hyphens, and underscores)
    const sanitizedFolder =
      rawFolder.toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'general';

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(
      process.cwd(),
      'public',
      'images',
      'products',
      sanitizedFolder
    );
    await mkdir(uploadDir, { recursive: true });

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const randomHash = Math.random().toString(36).substring(2, 8);
    const fileName = `${Date.now()}-${randomHash}-${safeName}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/images/products/${sanitizedFolder}/${fileName}`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'File upload failed',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin role required.' },
        { status: 401 }
      );
    }

    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Security check: only allow deletion within /images/products/ or /uploads/
    const normalizedUrl = path.normalize(url);
    if (
      !normalizedUrl.startsWith('/images/products/') &&
      !normalizedUrl.startsWith('/uploads/')
    ) {
      return NextResponse.json(
        { success: false, message: 'Invalid image path' },
        { status: 400 }
      );
    }

    const fullPath = path.join(process.cwd(), 'public', normalizedUrl);
    await rm(fullPath, { force: true });

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'File deletion failed',
      },
      { status: 500 }
    );
  }
}
