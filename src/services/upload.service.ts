import axiosInstance from './main.service';

/**
 * Interface for upload response
 */
interface UploadResponse {
    message: string;
    url: string;
}

/**
 * Interface for multiple upload response
 */
interface MultipleUploadResponse {
    message: string;
    urls: string[];
}

/**
 * Uploads a single image file
 * @param file - The file to upload
 * @returns Promise with the URL of the uploaded image
 * 
 * Example:
 * ```
 * // Upload a single image
 * const fileInput = document.querySelector('input[type="file"]');
 * const file = fileInput.files[0];
 * const response = await uploadImage(file);
 * const imageUrl = response.url;
 * ```
 */
export const uploadImage = async (file: File): Promise<UploadResponse> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axiosInstance.post<UploadResponse>(
            '/upload',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};

/**
 * Uploads multiple image files
 * @param files - Array of files to upload
 * @returns Promise with the URLs of the uploaded images
 * 
 * Example:
 * ```
 * // Upload multiple images
 * const fileInput = document.querySelector('input[type="file"][multiple]');
 * const files = Array.from(fileInput.files);
 * const response = await uploadMultipleImages(files);
 * const imageUrls = response.urls;
 * ```
 */
export const uploadMultipleImages = async (files: File[]): Promise<MultipleUploadResponse> => {
    try {
        const formData = new FormData();

        files.forEach((file) => {
            formData.append('files', file);
        });

        const response = await axiosInstance.post<MultipleUploadResponse>(
            '/upload/multiple',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error uploading multiple images:', error);
        throw error;
    }
};

// Export all functions as a single object for convenience
const uploadService = {
    uploadImage,
    uploadMultipleImages
};

export default uploadService;
