import axiosInstance from './main.service';
import { Category, CategoryResponse } from '../interface/category.interface';

class CategoryService {
    private baseUrl = '/categories';

    // Get all categories
    async getAllCategories(): Promise<CategoryResponse> {
        const response = await axiosInstance.get(this.baseUrl);
        return response.data;
    }

    // Get category by ID
    async getCategoryById(id: string | number): Promise<CategoryResponse> {
        const response = await axiosInstance.get(`${this.baseUrl}/${id}`);
        return response.data;
    }

    // Create a new category
    async createCategory(categoryData: Category): Promise<CategoryResponse> {
        const response = await axiosInstance.post(this.baseUrl, categoryData);
        return response.data;
    }

    // Update an existing category
    async updateCategory(id: string | number, categoryData: Category): Promise<CategoryResponse> {
        const response = await axiosInstance.put(`${this.baseUrl}/${id}`, categoryData);
        return response.data;
    }

    // Delete a category
    async deleteCategory(id: string | number): Promise<CategoryResponse> {
        const response = await axiosInstance.delete(`${this.baseUrl}/${id}`);
        return response.data;
    }
}

export default new CategoryService();
