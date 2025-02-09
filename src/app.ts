import express from "express";
import categoryRouter from "./category/category-router";
import productRouter from "./product/product-router";
import toppingRouter from "./topping/topping-router";
import globalErrorHandler from "./common/middleware/globalErrorHandler";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
    cors({
        origin: ["http://localhost:5173", "http://localhost:3000"],
        methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
        credentials: true,
    }),
);

app.use("/categories", categoryRouter);
app.use("/products", productRouter);
app.use("/toppings", toppingRouter);
app.use(globalErrorHandler);

export default app;
