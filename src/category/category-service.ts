import categoryModel from "./category-model";
import { Category } from "./category-types";

export default class CategoryService {
    async create(category: Category) {
        const newCategory = new categoryModel(category);
        return newCategory.save();
    }

    async getAll() {
        return categoryModel.find();
    }

    async getCategoryById(categoryId: string) {
        return categoryModel.findById(categoryId);
    }

    async deleteCategoryById(categoryId: string) {
        const category = await categoryModel.findById(categoryId);
        if (!category) {
            throw new Error(
                `Unable to fecth category with ID:${categoryId} at this moment`,
            );
        }
        await categoryModel.deleteOne({ _id: categoryId });
    }

    async updateCategory(category: Category, id: string) {
        return await categoryModel.findOneAndUpdate({ _id: id }, category, {
            new: true,
        });
    }
}
