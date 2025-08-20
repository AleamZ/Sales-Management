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

export interface CustomerCreateDto {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
}

export interface CustomerUpdateDto {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
}
