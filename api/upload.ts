import { v2 as cloudinary } from 'cloudinary';

const handler = async (req: any, res: any) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Configure Cloudinary with environment variables
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dbodkxhew',
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const { file, resourceType } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(file.split(',')[1], 'base64');

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType || 'auto',
          folder: 'cinestream',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message || 'Upload failed' });
  }
};

export default handler;
