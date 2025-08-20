import axiosInstance from "./main.service"; // Corrected import path

import {
  ProductData,
  ProductDataToCreate,
} from "../interface/product.interface"; // Adjusted import path

const API_URL = "/products";

// Interface for the API's data structure within the response
interface ApiProductsData {
  products: ProductData[];
  total: number;
  // Potentially other pagination fields like page, limit, etc.
}

// Interface for the full API response
interface GetProductsApiResponse {
  statusCode: number;
  ok: boolean;
  data: ApiProductsData;
  message: string;
}

/**
 * Creates a new product.
 * @param productData - The data for the new product.
 * @returns A promise that resolves with the API response.
 */
export const createProduct = async (
  productData: ProductDataToCreate
): Promise<unknown> => {
  try {
    const response = await axiosInstance.post(API_URL, productData);
    return response.data; // Assuming API returns data directly, or response.data.data
  } catch (error) {
    console.error("Error creating product:", error);
    throw error; // Re-throw to be handled by the caller
  }
};

/**
 * Updates an existing product.
 * @param id - The ID of the product to update.
 * @param productData - The data to update the product with.
 * @returns A promise that resolves with the API response.
 */
export const updateProduct = async (
  id: string | number,
  productData: Partial<ProductData>
): Promise<unknown> => {
  try {
    const response = await axiosInstance.put(`${API_URL}/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
};

/**
 * Deletes a product.
 * @param id - The ID of the product to delete.
 * @returns A promise that resolves with the API response.
 */
export const deleteProduct = async (id: string | number): Promise<unknown> => {
  try {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
};

/**
 * Fetches a list of products with pagination and filtering.
 * @param params - Query parameters including page, limit, keyword, etc.
 * @returns A promise that resolves with the list of products and total count.
 */

export const getSerialsProduct = async (payload: {
  productId: string;
  variableId: string;
}) => {
  const response = await axiosInstance.post(`${API_URL}/serials`, payload);
  return response.data;
};

export const getVariablesProduct = async (productId: string) => {
  const response = await axiosInstance.get(`${API_URL}/variables/${productId}`);
  return response.data;
};
export const getProducts = async (
  params?: Record<string, unknown>
): Promise<{ products: ProductData[]; total: number }> => {
  try {
    const response = await axiosInstance.get<GetProductsApiResponse>(API_URL, {
      params,
    });
    const apiData = response.data.data;

    const mappedProducts: ProductData[] = apiData.products
      .filter((apiProduct) => !apiProduct.isDelete) // Filter out deleted products
      .map((apiProduct) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, ...restOfApiProduct } = apiProduct;
        return {
          ...restOfApiProduct,
          _id: apiProduct._id, // Ensure _id is included
          // Ensure all fields required by ProductData are present or handled
          categoryId: apiProduct.categoryId, // Ensure this is correctly assigned
          // If productId is not part of apiProduct, it will be undefined, which is fine for ProductData.productId
          // Ensure productId is string or undefined
          productId: apiProduct.productId
            ? String(apiProduct.productId)
            : apiProduct._id
              ? String(apiProduct._id)
              : undefined,
        };
      });

    return { products: mappedProducts, total: apiData.total };
  } catch (error) {
    console.error("Error fetching products:", error);
    // Consider returning a default structure or re-throwing a custom error
    throw error;
  }
};

/**
 * Fetches a single product by its ID.
 * @param id - The ID of the product to fetch.
 * @returns A promise that resolves with the product data.
 */
export const getProductById = async (id: string | number): Promise<unknown> => {
  try {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};
