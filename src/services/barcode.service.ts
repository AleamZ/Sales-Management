import axiosInstance from './main.service';

const BARCODE_API_URL = '/products/barcode';

export interface BarcodeAvailabilityResponse {
    available: boolean;
    validFormat: boolean;
    suggestions?: string[];
    message: string;
}

export interface NextBarcodeResponse {
    nextBarcode: string;
    nextNumber: number;
    format: string;
    suggestion: string;
}

/**
 * Get next available barcode (auto-generated)
 */
export const getNextAvailableBarcode = async (): Promise<NextBarcodeResponse> => {
    try {
        const response = await axiosInstance.get(`${BARCODE_API_URL}/next-available`);
        return response.data.data;
    } catch (error) {
        console.error('Error getting next available barcode:', error);
        throw error;
    }
};

/**
 * Check if a barcode is available
 */
export const checkBarcodeAvailability = async (barcode: string): Promise<BarcodeAvailabilityResponse> => {
    try {
        const response = await axiosInstance.post(`${BARCODE_API_URL}/check-availability`, {
            barcode
        });
        return response.data.data;
    } catch (error) {
        console.error('Error checking barcode availability:', error);
        throw error;
    }
};

/**
 * Generate unique barcode (alias for getNextAvailableBarcode)
 */
export const generateUniqueBarcode = async (): Promise<string> => {
    const result = await getNextAvailableBarcode();
    return result.nextBarcode;
};

export default {
    getNextAvailableBarcode,
    checkBarcodeAvailability,
    generateUniqueBarcode,
}; 