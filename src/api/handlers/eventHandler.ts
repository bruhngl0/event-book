import { postEvent, getEvents, getEventById } from "../events";
import { Hono } from "hono";
import { Context } from "hono";

const eventHandler = new Hono();

eventHandler.all("/", async (c: Context) => {
  const method = c.req.method;
  if (method === "GET") {
    return getEvents(c);
  }
  if (method === "POST") {
    return postEvent(c);
  }
  return c.json({ error: "Method Not Allowed" }, 405);
});

eventHandler.all("/protected/:eventId", async (c: Context) => {
  const method = c.req.method;
  if (method === "GET") {
    return getEventById(c);
  }
});

export default eventHandler;
