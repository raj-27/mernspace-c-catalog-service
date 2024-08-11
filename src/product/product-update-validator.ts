import { body } from "express-validator";
export default [
    body("name")
        .exists()
        .withMessage("Product name is required")
        .isString()
        .withMessage("Product name should be string"),
    body("description").exists().withMessage("description  is required"),
    body("priceConfiguration")
        .exists()
        .withMessage("price config   is required"),
    body("attributes").exists().withMessage("Attribute field is required"),
    body("tenantId").exists().withMessage("Tenant id field is required"),
    body("categoryId").exists().withMessage("Category id field is required"),
];
