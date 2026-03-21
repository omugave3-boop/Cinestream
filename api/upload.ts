import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5000mb', // 5GB max upload
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { file, resourceType } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // file should be a base64 data URL (data:image/jpeg;base64,...)
    // Extract the base64 part
    const base64String = file.split(',')[1];
    if (!base64String) {
      return res.status(400).json({ error: 'Invalid file format' });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType === 'video' ? 'video' : 'image',
          timeout: 300000, // 5 minute timeout
          max_bytes: 5 * 1024 * 1024 * 1024, // 5GB
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // Convert base64 to buffer and pipe to stream
      const buffer = Buffer.from(base64String, 'base64');
      stream.end(buffer);
    });

    return res.status(200).json({ secure_url: result.secure_url });
  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({
      error: error?.message || 'Upload failed',
      details: error?.http_code ? `HTTP ${error.http_code}` : undefined,
    });
  }
}
