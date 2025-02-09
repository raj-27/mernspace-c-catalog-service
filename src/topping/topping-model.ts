import mongoose, { AggregatePaginateModel } from "mongoose";
import { Topping } from "./topping-type";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const toppingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    tenantId: {
        type: String,
        reuired: true,
    },
    isPublish: {
        type: Boolean,
        required: true,
        default: false,
    },
});

toppingSchema.plugin(aggregatePaginate);
export default mongoose.model<Topping, AggregatePaginateModel<Topping>>(
    "topping",
    toppingSchema,
);
