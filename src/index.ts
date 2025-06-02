import { Hono } from "hono";
import { PrismaClient } from "../prisma/generated/prisma-client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { cors } from "hono/cors";
import authMiddleware from "./middlewares/auth";
import userHandler from "./api/handlers/userHandler";
import eventHandler from "./api/handlers/eventHandler";
import bookingHandler from "./api/handlers/bookingHandler";
import clubHandler from "./api/handlers/clubHandler";
const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
  };
}>();

app.use(
  "/*",
  cors({
    origin: [
      "http://localhost:3000",

      "http://localhost:5173", // Vite dev server
      "https://social-dining.vercel.app",
      //   'https://www.yourdomain.com'
    ],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Cookie",
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true, // Enable credentials for cookies
    maxAge: 600,
  }),
);
app.use("api/v1/user/protected/*", authMiddleware);
app.use("api/v1/event/protected/*", authMiddleware);
app.use("api/v1/booking/protected/*", authMiddleware);
app.use("api/v1/club/protected/*", authMiddleware);

app.route("/api/v1/user", userHandler);
app.route("/api/v1/event", eventHandler);
app.route("/api/v1/booking", bookingHandler);
app.route("/api/v1/club", clubHandler);

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

export default app;
