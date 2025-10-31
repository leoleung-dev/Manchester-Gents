import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

async function uploadToCloudinary(buffer, folder, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        overwrite: true,
        quality: 'auto:eco',
        ...options
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Cloudinary upload failed.'));
          return;
        }
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const variant = formData.get('variant') || 'original';

    if (!file || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ error: 'No image provided.' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Image must be 5MB or smaller.' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, or WebP images are accepted.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const folder = variant === 'cropped'
      ? 'manchester-gents/profiles/cropped'
      : 'manchester-gents/profiles/original';

    const result = await uploadToCloudinary(buffer, folder, variant === 'cropped' ? { format: 'png' } : {});

    return NextResponse.json(
      {
        url: result.secure_url,
        publicId: result.public_id,
        variant
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Profile photo upload error:', error);
    return NextResponse.json({ error: 'Unable to upload image.' }, { status: 500 });
  }
}
