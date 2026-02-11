import mongoose, { Schema, Document } from "mongoose";
import { Attribute, Category, PriceConfiguration } from "./category-types";

// Create an interface that represents a Category Document in MongoDB
export interface CategoryDocument extends Category, Document {}

const priceConfigurationSchema = new Schema<PriceConfiguration>({
    priceType: {
        type: String,
        enum: ["base", "additional"], // Fixed typo: 'aditional' -> 'additional'
        required: true,
    },
    availableOptions: {
        type: [String],
        required: true,
    },
});

const attributeSchema = new Schema<Attribute>({
    name: {
        type: String,
        required: true,
    },
    widgetType: {
        type: String,
        enum: ["switch", "radio"],
        required: true, // Fixed typo: 'require' -> 'required'
    },
    defaultValue: {
        type: Schema.Types.Mixed,
        required: true,
    },
    availableOptions: {
        type: [String],
        required: true,
    },
});

// Use the Document interface here
const categorySchema = new Schema<CategoryDocument>(
    {
        name: {
            type: String,
            required: true,
        },
        priceConfiguration: {
            type: Map,
            of: priceConfigurationSchema,
            required: true,
        },
        attributes: {
            type: [attributeSchema],
            required: true,
        },
    },
    { timestamps: true },
);

export default mongoose.model<CategoryDocument>("Category", categorySchema);
