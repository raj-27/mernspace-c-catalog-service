import express from "express";
import categoryRouter from "./category/category-router";
import productRouter from "./product/product-router";
import toppingRouter from "./topping/topping-router";
import globalErrorHandler from "./common/middleware/globalErrorHandler";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Config } from "./config";
const app = express();

app.use(express.json());
app.use(cookieParser());

const ALLOWED_DOMAINS = [Config.CLIENT_UI, Config.ADMIN_UI];
app.use(
    cors({
        origin: ALLOWED_DOMAINS as string[],
        methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
        credentials: true,
    }),
);

app.use("/health", (req, res) => {
    res.send({ message: true });
});

app.use("/categories", categoryRouter);
app.use("/products", productRouter);
app.use("/toppings", toppingRouter);
app.use(globalErrorHandler);

export default app;
