import { paginationLabels } from "../config/pagination";
import productModel from "./product-model";
import { Filter, PageinateQuery, Product } from "./product-type";

export default class ProductService {
    async createProduct(product: Product) {
        return await productModel.create(product);
    }

    async updateProduct(productId: string, product: Product) {
        return await productModel.findOneAndUpdate(
            { _id: productId },
            { $set: product },
            { new: true },
        );
    }

    async getProducts(
        q: string,
        filters: Filter,
        pageinatQuery: PageinateQuery,
    ) {
        const searchQueryRegexp = new RegExp(q, "i");

        const matchQuery = {
            ...filters,
            name: searchQueryRegexp,
        };

        const aggregate = productModel.aggregate([
            {
                $match: matchQuery,
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "category",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                priceConfiguration: 1,
                                attributes: 1,
                            },
                        },
                    ],
                },
            },
            {
                $unwind: "$category",
            },
        ]);

        return productModel.aggregatePaginate(aggregate, {
            ...pageinatQuery,
            customLabels: paginationLabels,
        });
    }

    async getProduct(productId: string): Promise<Product | null> {
        try {
            return await productModel.findById(productId);
        } catch (error) {
            return null;
        }
    }
}
