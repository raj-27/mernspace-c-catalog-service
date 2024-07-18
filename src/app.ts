import express from "express";
import categoryRouter from "./category/category-router";
import productRouter from "./product/product-router";
import globalErrorHandler from "./common/middleware/globalErrorHandler";
import cookieParser from "cookie-parser";
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/categories", categoryRouter);
app.use("/products", productRouter);
app.use(globalErrorHandler);

export default app;
