import axiosInstance from "./main.service";

// Types for authentication
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    // username: string;
    password: string;
    email: string;
    fullName: string;
    // Add other required fields for registration
}

// Updated to match the actual API response structure
export interface AuthResponse {
    statusCode: number;
    ok: boolean;
    data: {
        accessToken: string;
        refreshToken?: string;
    };
    message: string;
}

/**
 * Login user with email and password
 * @param credentials - Email and password
 * @returns Authentication response with tokens and user information
 */
export const loginService = async (credentials: LoginRequest) => {
    try {
        const response = await axiosInstance.post("/auth/login", credentials);
        return response.data;
    } catch (error) {
        // Format and rethrow error for better handling
        console.error("Login service error:", error);
        throw error;
    }
};

/**
 * Register a new user
 * @param registerData - User registration data
 * @returns Authentication response with tokens and user information
 */
export const registerService = async (registerData: RegisterRequest) => {
    try {
        // Changed from "/auth/register" to "/register" based on the endpoint pattern
        const response = await axiosInstance.post("/auth/register", registerData);
        return response.data;
    } catch (error) {
        console.error("Register service error:", error);
        throw error;
    }
};

/**
 * Check if user is currently logged in
 * @returns Boolean indicating whether user is logged in
 */

export const isLoggedIn = (): boolean => {
    return !!localStorage.getItem("accessToken");
};

/**
 * Get the current authentication token
 * @returns The current access token or null if not logged in
 */
export const getToken = (): string | null => {
    return localStorage.getItem("accessToken");
};

/**
 * Set authentication token in local storage
 * @param token - The access token to store
 */
export const setToken = (token: string): void => {
    localStorage.setItem("accessToken", token);
};

/**
 * Set refresh token in local storage
 * @param token - The refresh token to store
 */
export const setRefreshToken = (token: string): void => {
    localStorage.setItem("refreshToken", token);
};

/**
 * Clear authentication tokens from local storage
 */
export const clearTokens = (): void => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
};

export const forgotPassword = async (email: string) => {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
};

export const verifyOTP = async (email: string, otp: string) => {
    const response = await axiosInstance.post('/auth/verify-otp', { email, otp });
    return response.data;
};

export const resetPassword = async (email: string, otp: string, newPassword: string) => {
    const response = await axiosInstance.post('/auth/reset-password', {
        email,
        otp,
        newPassword
    });
    return response.data;
};
