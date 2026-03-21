import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { resourceType } = req.body;

    if (!resourceType || !['video', 'image'].includes(resourceType)) {
      return res.status(400).json({ error: 'Invalid resource type' });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(500).json({ error: 'Missing Cloudinary credentials' });
    }

    // Generate timestamp (valid for 1 hour)
    const timestamp = Math.floor(Date.now() / 1000);

    // Build auth string for signature
    const authString = `timestamp=${timestamp}${apiSecret}`;

    // Generate SHA-256 signature
    const signature = crypto
      .createHash('sha256')
      .update(authString)
      .digest('hex');

    return res.status(200).json({
      url: `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      apiKey,
      timestamp,
      signature,
      cloudName,
    });
  } catch (error: any) {
    console.error('Signed URL generation error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate signed URL',
    });
  }
}
