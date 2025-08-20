export interface Brand {
    _id?: string;
    name: string;
    isDelete?: boolean;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    description?: string;
    logo?: string;
    // Keep other optional fields that might be used in your application
}