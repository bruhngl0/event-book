import { verify } from "hono/jwt";
import { Context, Next } from "hono";

const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");
  const secretKey = c.env.JWT_SECRET;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid Authorization header" }, 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = await verify(token, secretKey);
    if (!payload) {
      return c.json({ error: "Invalid or expired token" }, 403);
    }

    // Attach user info to context
    c.set("user", payload); // This way you can access full payload

    return next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return c.json({ error: "Token verification failed" }, 401);
  }
};

export default authMiddleware;
