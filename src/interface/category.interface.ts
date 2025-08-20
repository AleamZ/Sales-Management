export interface Category {
    _id?: string;
    name: string;
    // description?: string;
    // Add other properties as needed
}
export interface CategoryResponse {
    data: Category | Category[];
    message: string;
    statusCode: number;
}