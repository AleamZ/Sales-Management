import axiosInstance from './main.service';
import { ProductVariantData, AttributeData } from '../interface/product.interface';

const API_URL = '/variables';

// Interface for the raw variable object from the API (with _id)
interface ApiVariable extends Omit<ProductVariantData, 'id'> {
    _id: string;
    // Include other fields if the API returns more than ProductVariantData for a variable
}

// Interface for the variable data after mapping _id to id (this will be ProductVariantData with id guaranteed)
export interface MappedVariableData extends ProductVariantData {
    id: string;
}

// DTO for creating a variable. Adjust fields based on your backend's CreateVariableDto.
// Assuming it's ProductVariantData without id, _id, isDelete.
export interface CreateVariableDto {
    attribute: AttributeData[];
    costPrice: number;
    sellPrice: number;
    stock: number;
    description?: string;
    mainImage?: string;
    listImage?: string[];
    isSerial?: boolean;
    serials?: string[];
    // Add productId here if your backend CreateVariableDto requires it:
    // productId: string;
}

// DTO for updating a variable.
export type UpdateVariableDto = Partial<CreateVariableDto>;

// Interface for the API response when fetching/creating/updating a single variable
interface SingleVariableApiResponse {
    statusCode: number;
    ok: boolean;
    data: ApiVariable; // Backend sends ApiVariable (with _id)
    message: string;
}

// Interface for the API response when deleting a variable
interface DeleteVariableApiResponse {
    statusCode: number;
    ok: boolean;
    data: null; // Or a more specific type if the backend returns something in data on delete
    message: string;
}

// Helper function to map _id to id
const mapApiVariableToFrontend = (apiVariable: ApiVariable): MappedVariableData => {
    const { _id, ...rest } = apiVariable;
    return {
        ...rest,
        id: _id,
    };
};

/**
 * Creates a new variable.
 * @param dto - The data for the new variable.
 * @returns A promise that resolves with the API response containing the created variable (mapped with id).
 */
export const createVariable = async (dto: CreateVariableDto): Promise<{ variable: MappedVariableData; message: string; statusCode: number; ok: boolean }> => {
    try {
        const response = await axiosInstance.post<SingleVariableApiResponse>(API_URL, dto);
        const { data: apiVariable, message, statusCode, ok } = response.data;
        return { variable: mapApiVariableToFrontend(apiVariable), message, statusCode, ok };
    } catch (error) {
        console.error('Error creating variable:', error);
        throw error;
    }
};

/**
 * Fetches a single variable by its ID.
 * @param id - The ID of the variable to fetch.
 * @returns A promise that resolves with the API response containing the variable data (mapped with id).
 */
export const getVariableById = async (id: string): Promise<{ variable: MappedVariableData; message: string; statusCode: number; ok: boolean }> => {
    try {
        const response = await axiosInstance.get<SingleVariableApiResponse>(`${API_URL}/${id}`);
        const { data: apiVariable, message, statusCode, ok } = response.data;
        return { variable: mapApiVariableToFrontend(apiVariable), message, statusCode, ok };
    } catch (error) {
        console.error(`Error fetching variable ${id}:`, error);
        throw error;
    }
};

/**
 * Updates an existing variable.
 * @param id - The ID of the variable to update.
 * @param dto - The data to update the variable with.
 * @returns A promise that resolves with the API response containing the updated variable (mapped with id).
 */
export const updateVariable = async (id: string, dto: UpdateVariableDto): Promise<{ variable: MappedVariableData; message: string; statusCode: number; ok: boolean }> => {
    try {
        const response = await axiosInstance.put<SingleVariableApiResponse>(`${API_URL}/${id}`, dto);
        const { data: apiVariable, message, statusCode, ok } = response.data;
        return { variable: mapApiVariableToFrontend(apiVariable), message, statusCode, ok };
    } catch (error) {
        console.error(`Error updating variable ${id}:`, error);
        throw error;
    }
};

/**
 * Deletes a variable.
 * @param id - The ID of the variable to delete.
 * @returns A promise that resolves with the API response.
 */
export const deleteVariable = async (id: string): Promise<DeleteVariableApiResponse> => {
    try {
        const response = await axiosInstance.delete<DeleteVariableApiResponse>(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting variable ${id}:`, error);
        throw error;
    }
};
