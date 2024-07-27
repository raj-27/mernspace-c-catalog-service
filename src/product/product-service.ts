import productModel from "./product-model";
import { Product } from "./product-type";

export default class ProductService {
    async createProduct(product: Product) {
        return await productModel.create(product);
    }
}
