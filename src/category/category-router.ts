import express from "express";
import CategoryController from "./category-controller";

const router = express.Router();

const categoryController = new CategoryController();

router.get("/", (req, res, next) => categoryController.create(req, res, next));

export default router;
