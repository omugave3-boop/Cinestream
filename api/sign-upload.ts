import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { resourceType } = req.body;

    if (!resourceType || !['video', 'image'].includes(resourceType)) {
      return res.status(400).json({ error: 'Invalid resource type' });
    }

    // Create a signed upload with timestamp and signature
    const timestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
      },
      process.env.CLOUDINARY_API_SECRET
    );

    return res.status(200).json({
      url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
      apiKey: process.env.CLOUDINARY_API_KEY,
      timestamp: timestamp,
      signature: signature,
    });
  } catch (error: any) {
    console.error('Signed URL generation error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate signed URL',
    });
  }
}