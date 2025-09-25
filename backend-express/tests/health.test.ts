import request from "supertest";
import app from "../src/app";

describe("Health Check", () => {
  it("should return healthy status", async () => {
    const response = await request(app).get("/health").expect(200);

    expect(response.body).toHaveProperty("status", "healthy");
    expect(response.body).toHaveProperty("timestamp");
    expect(response.body).toHaveProperty("uptime");
    expect(response.body).toHaveProperty("version");
  });

  it("should return valid timestamp", async () => {
    const response = await request(app).get("/health").expect(200);

    const timestamp = new Date(response.body.timestamp);
    expect(timestamp).toBeInstanceOf(Date);
    expect(isNaN(timestamp.getTime())).toBe(false);
  });

  it("should return positive uptime", async () => {
    const response = await request(app).get("/health").expect(200);

    expect(typeof response.body.uptime).toBe("number");
    expect(response.body.uptime).toBeGreaterThan(0);
  });
});
