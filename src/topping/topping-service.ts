import { paginationLabels } from "../config/pagination";
import toppingModel from "./topping-model";
import { Filter, PageinateQuery, Topping } from "./topping-type";

export default class ToppingService {
    async create(topping: Topping) {
        const newTopping = new toppingModel(topping);
        return newTopping.save();
    }
    async getTopping(toppingId: string) {
        return toppingModel.findById(toppingId);
    }

    async update(toppingId: string, topping: Topping) {
        return toppingModel.findOneAndUpdate(
            { _id: toppingId },
            { $set: topping },
            { new: true },
        );
    }

    async getList(q: string, filters: Filter, pageinatQuery: PageinateQuery) {
        const searchQueryRegexp = new RegExp(q, "i");

        const matchQuery = {
            ...filters,
            name: searchQueryRegexp,
        };

        const aggregate = toppingModel.aggregate([
            {
                $match: matchQuery,
            },
        ]);

        return toppingModel.aggregatePaginate(aggregate, {
            ...pageinatQuery,
            customLabels: paginationLabels,
        });
    }

    async delete(toppingId: string) {
        await toppingModel.deleteOne({ _id: toppingId });
    }
}
