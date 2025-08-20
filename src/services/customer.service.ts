import axiosInstance from './main.service';

/**
 * Interface for Customer data
 */
export interface Customer {
    _id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
    totalOrders?: number;
    totalSpent?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Interface for creating a new customer
 */
export interface CustomerCreateDto {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
}

/**
 * Interface for updating an existing customer
 */
export interface CustomerUpdateDto {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
}

/**
 * Interface for API response structure
 */
interface ApiResponse<T> {
    statusCode: number;
    ok: boolean;
    data: T;
    message: string;
}

const API_URL = '/customers';

/**
 * Creates a new customer
 * @param customerData - Customer data to create
 * @returns Promise with created customer data
 * 
 * Example:
 * ```
 * // Create customer
 * const newCustomer = await createCustomer({
 *   name: "Nguyen Van A",
 *   phone: "0987654321",
 *   address: "123 Example St.",
 *   email: "example@mail.com"
 * });
 * ```
 */
export const createCustomer = async (customerData: CustomerCreateDto): Promise<ApiResponse<Customer>> => {
    try {
        const response = await axiosInstance.post<ApiResponse<Customer>>(API_URL, customerData);
        return response.data;
    } catch (error) {
        console.error('Error creating customer:', error);
        throw error;
    }
};

/**
 * Retrieves all customers with optional filtering
 * @param keyword - Optional search term for filtering by name or phone
 * @returns Promise with list of customers
 * 
 * Example:
 * ```
 * // Get all customers
 * const allCustomers = await getAllCustomers();
 * 
 * // Search for customers with "Dat" in name or phone
 * const searchResults = await getAllCustomers("Dat");
 * ```
 */
export const getAllCustomers = async (keyword?: string): Promise<ApiResponse<Customer[]>> => {
    try {
        const params = keyword ? { keyword } : undefined;
        const response = await axiosInstance.get<ApiResponse<Customer[]>>(API_URL, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching customers:', error);
        throw error;
    }
};

/**
 * Retrieves a single customer by ID
 * @param id - The ID of the customer to retrieve
 * @returns Promise with customer data
 * 
 * Example:
 * ```
 * // Get customer by ID
 * const customer = await getCustomerById("645d1234567890abcdef1234");
 * ```
 */
export const getCustomerById = async (id: string): Promise<ApiResponse<Customer>> => {
    try {
        const response = await axiosInstance.get<ApiResponse<Customer>>(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching customer ${id}:`, error);
        throw error;
    }
};

/**
 * Updates an existing customer
 * @param id - The ID of the customer to update
 * @param updateData - The data to update
 * @returns Promise with updated customer data
 * 
 * Example:
 * ```
 * // Update customer address
 * const updatedCustomer = await updateCustomer("645d1234567890abcdef1234", {
 *   address: "456 New Address"
 * });
 * ```
 */
export const updateCustomer = async (id: string, updateData: CustomerUpdateDto): Promise<ApiResponse<Customer>> => {
    try {
        const response = await axiosInstance.put<ApiResponse<Customer>>(`${API_URL}/${id}`, updateData);
        return response.data;
    } catch (error) {
        console.error(`Error updating customer ${id}:`, error);
        throw error;
    }
};

/**
 * Deletes a customer (soft delete)
 * @param id - The ID of the customer to delete
 * @returns Promise with delete operation result
 * 
 * Example:
 * ```
 * // Delete customer
 * await deleteCustomer("645d1234567890abcdef1234");
 * ```
 */
export const deleteCustomer = async (id: string): Promise<ApiResponse<null>> => {
    try {
        const response = await axiosInstance.delete<ApiResponse<null>>(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting customer ${id}:`, error);
        throw error;
    }
};

/**
 * Searches for customers by keyword (name or phone)
 * @param keyword - Search term
 * @returns Promise with matching customers
 * 
 * Example:
 * ```
 * // Search for customers with keyword
 * const results = await searchCustomers("Dat");
 * ```
 */
export const searchCustomers = async (keyword: string): Promise<ApiResponse<Customer[]>> => {
    return getAllCustomers(keyword);
};

/**
 * Retrieves customers with optional parameters for pagination and search
 * @param params - Optional parameters including keyword, page, and limit
 * @returns Promise with customers and pagination info
 */
export const getCustomers = async (params?: {
    keyword?: string;
    page?: number;
    limit?: number;
}): Promise<ApiResponse<{ customers: Customer[]; total: number }>> => {
    try {
        const response = await axiosInstance.get<ApiResponse<{ customers: Customer[]; total: number }>>(
            API_URL,
            { params }
        );
        return response.data;
    } catch (error) {
        console.error('Error getting customers:', error);
        throw error;
    }
};

// Export all functions as a single object for convenience
const customerService = {
    create: createCustomer,
    getAll: getAllCustomers,
    getById: getCustomerById,
    update: updateCustomer,
    delete: deleteCustomer,
    search: searchCustomers,
    get: getCustomers
};

export default customerService;
