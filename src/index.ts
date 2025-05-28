import { Hono } from "hono";
import { PrismaClient } from "../prisma/generated/prisma-client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { cors } from "hono/cors";
import authMiddleware from "./middlewares/auth";
import userHandler from "./api/handlers/userHandler";
const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
  };
}>();

app.use("/*", cors());
app.use("api/v1/user/protected/*", authMiddleware);

export const getPrisma = (database_url: string) => {
  const prisma = new PrismaClient({
    datasourceUrl: database_url,
  }).$extends(withAccelerate());
  return prisma;
};

app.get("/", (c) => {
  const url = c.env.DATABASE_URL;
  console.log(url);
  return c.text("STILL CIRCLE-FORM SB");
});

app.route("/api/v1/user", userHandler);

export default app;
