import mongoose from "mongoose";
import { Config } from "../config/index";

export const initDb = async () => {
    await mongoose.connect(Config.DATABASE_URL as string);
};
