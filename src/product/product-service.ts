import productModel from "./product-model";
import { Product } from "./product-type";

export default class ProductService {
    async createProduct(product: Product) {
        return await productModel.create(product);
    }

    async getProductImage(productId: string) {
        const product = await productModel.findById(productId).select("image");
        return product?.image;
    }

    async updateProduct(productId: string, product: Product) {
        return await productModel.findOneAndUpdate(
            { _id: productId },
            { $set: product },
            { new: true },
        );
    }

    async getProduct(productId: string): Promise<Product | null> {
        try {
            return await productModel.findById(productId);
        } catch (error) {
            return null;
        }
    }
}
