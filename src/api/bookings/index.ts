//booking-post
//
//Book API + Razorpay	(same page, modal)	Booking + Razorpay checkout opens

import { Context } from "hono";
import { getPrisma } from "../..";
import { bookingEvent } from "../../types";

export const bookEvent = async (c: Context) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const body = await c.req.json();
  const parsed = bookingEvent.safeParse(body);
  if (!parsed.success) {
    return c.json({ message: parsed.error.message }, 400);
  }

  const { eventId } = parsed.data;
  const sanitizedEventId = eventId.trim();
  const userId = c.get("user");
  if (!userId) {
    return c.json({ message: "userId doesnt exist" });
  }

  try {
    const payload: any = {
      userId,
      eventId: sanitizedEventId,
      status: "PENDING",
    };

    const alreadyBooked = await prisma.booking.findFirst({
      where: { userId, eventId },
    });

    if (alreadyBooked) {
      return c.json({ message: "user already booked" });
    }

    const bookEvent = await prisma.booking.create({
      data: payload,
    });

    return c.json({ message: "booked successfully", bookEvent }, 200);
  } catch (error: unknown) {
    console.error({ error: "error-booking-event" }, 400);
    return c.json({ message: "error-booking-event" }, 400);
  }
};

export const getAllBookings = async (c: Context) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  try {
    const allBookings = await prisma.booking.findMany({});
    return c.json({ message: "all booked users", allBookings }, 200);
  } catch (error: unknown) {
    console.error({ message: "failed to fetch bookings" }, 400);
    return c.json({ error: "failed to fetch bookings" }, 400);
  }
};
