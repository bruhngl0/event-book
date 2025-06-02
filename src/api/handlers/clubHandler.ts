import { addClubs, joinClub } from "../clubs";
import { Hono } from "hono";
import { Context } from "hono";

const clubHandler = new Hono();

clubHandler.all("/", async (c: Context) => {
  const method = c.req.method;
  if (method === "POST") {
    return addClubs(c);
  }
  return c.json({ error: "Method Not Allowed" }, 405);
});

clubHandler.all("/protected/:clubId", async (c: Context) => {
  const method = c.req.method;
  if (method === "GET") {
    return addClubs(c);
  }

  if (method === "UPDATE") {
    return joinClub(c);
  }
});

export default clubHandler;
