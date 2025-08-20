import axiosInstance from './main.service';

export interface UpdateProfileData {
    name?: string;
    email?: string;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface UserProfile {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

export const AccountService = {
    // Get user profile
    getProfile: async (): Promise<UserProfile> => {
        const response = await axiosInstance.get('/account/profile');
        return response.data.data;
    },

    // Update user profile
    updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
        const response = await axiosInstance.patch('/account/profile', data);
        return response.data.data;
    },

    // Change password
    changePassword: async (data: ChangePasswordData): Promise<void> => {
        await axiosInstance.post('/account/change-password', data);
    },
}; 