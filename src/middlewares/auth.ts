import { verify } from "hono/jwt";
import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";

const authMiddleware = async (c: Context, next: Next) => {
  const token = getCookie(c, "token");
  const secretKey = c.env.JWT_SECRET;

  if (!token) {
    console.error({
      message:
        "middleware-jwt-token not reaching to backend from frontend-cookie",
    });
    return c.json(
      {
        error:
          "middleware-jwt-token not reaching to backend from frontend-cookie",
      },
      404,
    );
  }
  try {
    const decodedPayload = await verify(token, secretKey);
    console.log(decodedPayload.sub);

    c.set("user", decodedPayload.sub);

    return next();
  } catch {
    console.error({
      message:
        "authentication-middleware-failed-token-check-for-protected-routes",
    });
    return c.json(
      {
        error:
          "authentication-middleware-failed-token-check-for-protected-routes",
      },
      404,
    );
  }
};

export default authMiddleware;
