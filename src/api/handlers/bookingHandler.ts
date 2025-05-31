import {} from "../events";
import { Hono } from "hono";
import { Context } from "hono";
import { bookEvent, getAllBookings } from "../bookings";

const bookingHandler = new Hono();

bookingHandler.all("/protected/book", async (c: Context) => {
  const method = c.req.method;
  if (method === "GET") {
    return getAllBookings(c);
  }
  if (method === "POST") {
    return bookEvent(c);
  }
  return c.json({ error: "Method Not Allowed" }, 405);
});

export default bookingHandler;
