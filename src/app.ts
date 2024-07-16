import express from "express";
import categoryRouter from "./category/category-router";
import globalErrorHandler from "./middleware/globalErrorHandler";
import categoryValidator from "./category/category-validator";

const app = express();

app.use("/category", categoryValidator, categoryRouter);

app.use(globalErrorHandler);

export default app;
