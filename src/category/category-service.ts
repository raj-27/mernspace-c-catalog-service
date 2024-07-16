import categoryModel from "./category-model";
import { Category } from "./category-types";

export default class CategoryService {
    async create(category: Category) {
        const newCategory = new categoryModel(category);
        return newCategory.save();
    }
}
