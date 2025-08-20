import axiosInstance from './main.service';
import { Brand } from '../interface/brand.interface'; // Adjust the import path as necessary
// Define the Brand interface based on the actual API response

/**
 * Create a new brand
 * @param brand The brand data to create
 * @returns Promise with the created brand data
 */
export const createBrand = async (brand: Omit<Brand, '_id' | 'createdAt' | 'updatedAt'>): Promise<Brand> => {
    const response = await axiosInstance.post('/brands', brand);
    return response.data;
};

/**
 * Get all brands
 * @returns Promise with the response containing brands array in the data property
 */
export const getAllBrands = async () => {
    const response = await axiosInstance.get('/brands');
    // Return the entire response so components can access both the data array 
    // and any metadata (status, message, etc.)
    return response.data;
};

/**
 * Update a brand by ID
 * @param id The ID of the brand to update
 * @param brand The brand data to update
 * @returns Promise with the updated brand data
 */
export const updateBrand = async (id: string, brand: Partial<Brand>) => {
    const response = await axiosInstance.put(`/brands/${id}`, brand);
    return response.data;
};

/**
 * Delete a brand (soft delete)
 * @param id The ID of the brand to delete
 * @returns Promise with the deletion response
 */
export const deleteBrand = async (id: string) => {
    const response = await axiosInstance.delete(`/brands/${id}`);
    return response.data;
};