/**
 * Deccan Care Maternity & General Hospital
 * Cloudinary Media Storage Service
 * 
 * Handles client-side unsigned uploads to Cloudinary for doctor photographs
 * and hospital gallery images without exposing API secrets.
 */

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  created_at: string;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const cloudinaryService = {
  /**
   * Validate file type and size according to hospital security standards
   */
  validateImage(file: File): { isValid: boolean; error?: string } {
    if (!file) {
      return { isValid: false, error: 'No file provided.' };
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return {
        isValid: false,
        error: 'Please upload a JPG, PNG, or WebP image under 10MB.',
      };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        isValid: false,
        error: 'Please upload a JPG, PNG, or WebP image under 10MB.',
      };
    }

    return { isValid: true };
  },

  /**
   * Upload image using Cloudinary Unsigned Upload Preset
   * @param file Image file to upload (JPEG, PNG, or WebP)
   * @param folder Subfolder under deccan-care (e.g. 'deccan-care/doctors' or 'deccan-care/gallery')
   */
  async uploadImage(
    file: File,
    folder: 'deccan-care/doctors' | 'deccan-care/gallery' = 'deccan-care/gallery'
  ): Promise<CloudinaryUploadResult> {
    const validation = this.validateImage(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'lnzz0kuu';
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'deccan-care-images';

    if (!cloudName || !uploadPreset) {
      throw new Error(
        'Cloudinary is not configured. Please verify VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env'
      );
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', folder);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData?.error?.message ||
          `Upload to Cloudinary failed with HTTP status ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();

      return {
        secure_url: data.secure_url,
        public_id: data.public_id,
        width: data.width,
        height: data.height,
        format: data.format,
        bytes: data.bytes,
        created_at: data.created_at || new Date().toISOString(),
      };
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Network error uploading to Cloudinary.';
      console.error('[Cloudinary Upload Error]', msg);
      throw new Error(msg);
    }
  },

  /**
   * Generate optimized Cloudinary delivery URL with auto-format and auto-quality
   */
  getOptimizedUrl(
    originalUrl: string,
    transformations: { width?: number; height?: number; crop?: string } = {}
  ): string {
    if (!originalUrl || !originalUrl.includes('cloudinary.com')) {
      return originalUrl;
    }

    // Insert f_auto,q_auto transformation into Cloudinary URL path
    const parts = originalUrl.split('/upload/');
    if (parts.length !== 2) return originalUrl;

    const transformList = ['f_auto', 'q_auto'];
    if (transformations.width) transformList.push(`w_${transformations.width}`);
    if (transformations.height) transformList.push(`h_${transformations.height}`);
    if (transformations.crop) transformList.push(`c_${transformations.crop}`);

    return `${parts[0]}/upload/${transformList.join(',')}/${parts[1]}`;
  },
};
