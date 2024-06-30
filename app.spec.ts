import request from "supertest";
import { calculateDiscount } from "./src/util";
import app from "./src/app";

describe("App", () => {
    it("It should calculate discount", () => {
        const result = calculateDiscount(100, 10);
        expect(result).toBe(10);
    });

    it("Should return 200 Status", async () => {
        const response = await request(app).get("/").send();
        expect(response.statusCode).toBe(200);
    });
});
