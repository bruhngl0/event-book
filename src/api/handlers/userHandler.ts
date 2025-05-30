import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
  signIn,
  getUserToken,
} from "../users";
import { Hono } from "hono";
import { Context } from "hono";

const userHandler = new Hono();

userHandler.all("/", async (c: Context) => {
  const method = c.req.method;
  if (method === "GET") {
    return getUsers(c);
  }
  return c.json({ error: "Method Not Allowed" }, 405);
});

userHandler.all("/signup", async (c: Context) => {
  const method = c.req.method;
  if (method === "POST") {
    return createUser(c);
  }
  return c.json({ error: "Method Not Allowed" }, 405);
});

userHandler.all("/signin", async (c: Context) => {
  const method = c.req.method;
  if (method === "POST") {
    return signIn(c);
  }
  return c.json({ error: "Method Not Allowed" }, 405);
});

userHandler.all("/protected/:id", async (c: Context) => {
  const method = c.req.method;
  if (method === "PUT") {
    return updateUser(c);
  }
  if (method === "DELETE") {
    return deleteUser(c);
  }
  return c.json({ error: "Method not Allowed" });
});

userHandler.all("/me", async (c: Context) => {
  const method = c.req.method;
  if (method === "GET") {
    return getUserToken(c);
  }
  return c.json({ error: "Method not Allowed" });
});
export default userHandler;
