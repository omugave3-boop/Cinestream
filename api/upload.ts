import { v2 as cloudinary } from 'cloudinary';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '500mb',
    },
  },
};

const handler = async (req: any, res: any) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const { file, resourceType } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // For large files, use direct stream to Cloudinary
    const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid file format' });
    }

    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');

    // Upload to Cloudinary with higher timeout
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType === 'video' ? 'video' : 'image',
          folder: 'cinestream',
          timeout: 300000, // 5 minutes
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.on('error', (error) => {
        reject(new Error(`Stream error: ${error.message}`));
      });

      uploadStream.end(buffer);
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      error: error.message || 'Upload failed',
      details: error.toString()
    });
  }
};

export default handler;
