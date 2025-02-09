import mongoose from "mongoose";

export interface Topping {
    name: string;
    image: string;
    price: number;
    tenantId: string;
    isPublish: boolean;
}

export interface Filter {
    tenantId?: string;
    categoryId?: mongoose.Types.ObjectId;
    isPublish?: boolean;
}

export interface PageinateQuery {
    page: number;
    limit: number;
}
