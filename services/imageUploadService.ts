// Service for uploading images to Cloudinary
// Note: For production, you should use Cloudinary's upload preset with unsigned uploads

interface UploadResponse {
    success: boolean;
    url?: string;
    error?: string;
}

export async function uploadImage(file: File): Promise<UploadResponse> {
    try {
        // For now, we'll convert to base64 and return a data URL
        // In production, you should upload to Cloudinary or similar service

        return new Promise((resolve) => {
            const reader = new FileReader();

            reader.onloadend = () => {
                const base64String = reader.result as string;
                resolve({
                    success: true,
                    url: base64String
                });
            };

            reader.onerror = () => {
                resolve({
                    success: false,
                    error: 'Failed to read image file'
                });
            };

            reader.readAsDataURL(file);
        });
    } catch (error) {
        console.error('Image upload error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

// Compress image before upload (optional but recommended)
export async function compressImage(file: File, maxWidth: number = 1200): Promise<File> {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });
                        resolve(compressedFile);
                    } else {
                        resolve(file);
                    }
                }, 'image/jpeg', 0.8);
            };

            img.src = e.target?.result as string;
        };

        reader.readAsDataURL(file);
    });
}
