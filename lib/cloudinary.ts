import { v2 as cloudinary, type ConfigOptions } from 'cloudinary';

// Tipos para las opciones de firma
interface SignOptions extends Record<string, unknown> {
  type?: string;
  secure?: boolean;
  [key: string]: unknown;
}

interface SignResponse {
  signature: string;
  timestamp: number;
  url?: string;
}

const cloudinaryConfig: ConfigOptions = {
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
};

cloudinary.config(cloudinaryConfig);

export const signUpload = (publicId: string, options: SignOptions = {}): SignResponse => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const params = {
    timestamp,
    ...options,
    public_id: publicId,
  };

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET as string
  );

  return { timestamp, signature };
};

export const getSignedImageUrl = (
  publicId: string,
  transformations: Record<string, unknown> = {}
): string => {
  const signOptions: SignOptions = {
    type: 'authenticated',
    secure: true,
  };

  // Copiar solo las propiedades válidas de transformations a signOptions
  Object.entries(transformations).forEach(([key, value]) => {
    if (value !== undefined) {
      signOptions[key] = value;
    }
  });

  const { timestamp, signature } = signUpload(publicId, signOptions);

  const urlOptions: Record<string, unknown> = {
    sign_url: true,
    type: 'authenticated',
    secure: true,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    timestamp,
    signature,
    ...transformations,
  };

  return cloudinary.url(publicId, urlOptions);
};

export default cloudinary;
