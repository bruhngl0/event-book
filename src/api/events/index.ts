// CRUDEVENTS-----

import { Context } from "hono";
import { getPrisma } from "../..";
import { createEvent } from "../../types";

export const getEvents = async (c: Context) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  try {
    const allEvents = await prisma.event.findMany({});
    return c.json({ message: "sent all events", allEvents }, 200);
  } catch (error: unknown) {
    console.error({ message: "failed to get events" }, 400);
    return c.json({ error: "failed to get events" }, 400);
  }
};
//create an event

export const postEvent = async (c: Context) => {
  const prisma = getPrisma(c.env.DATABASE_URL);

  try {
    const body = await c.req.json();
    const parsed = createEvent.safeParse(body);

    if (!parsed.success) {
      return c.json({ error: parsed.error.message }, 400);
    }

    const { title, description, location, date, price } = parsed.data;
    const sanitizedTitle = title.toLowerCase().trim();
    const sanitizedDescription = description?.trim();
    const sanitizedLocation = location.trim();

    if (!sanitizedTitle || !sanitizedLocation) {
      return c.json(
        {
          error: "Title and location cannot be empty",
        },
        400,
      );
    }

    // Validate and sanitize price
    if (price < 0) {
      return c.json(
        {
          error: "Price cannot be negative",
        },
        400,
      );
    }
    const sanitizedPrice = Math.round(price * 100) / 100; // Proper rounding for currency

    // Validate date
    const eventDate = date;
    if (isNaN(eventDate.getTime())) {
      return c.json(
        {
          error: "Invalid date format",
        },
        400,
      );
    }

    // Check if date is in the past
    if (eventDate < new Date()) {
      return c.json(
        {
          error: "Event date cannot be in the past",
        },
        400,
      );
    }

    // Create event payload
    const eventPayload = {
      title: sanitizedTitle,
      location: sanitizedLocation,
      date: eventDate,
      price: sanitizedPrice,
      ...(sanitizedDescription && { description: sanitizedDescription }),
    };

    const eventData = await prisma.event.create({
      data: eventPayload,
    });

    return c.json({ message: "event created successfully", eventData }, 200);
  } catch (error: unknown) {
    console.error({ error: "failed to create event" }, 400);
    return c.json({ error: "failed to create event" }, 400);
  }
};

export const getEventById = async (c: Context) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const eventId = c.req.param("eventId");
  const userId = c.get("user");

  if (!userId) {
    return c.json(
      { message: "user-id not extracted from token from cookies-jwt-auth" },
      404,
    );
  }
  console.log(userId);

  if (!eventId) {
    return c.json(
      { message: "event-id-not doesnt exist/fetched-from-frontend" },
      404,
    );
  }

  try {
    const getEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    return c.json({ message: "get event details", getEvent }, 200);
  } catch (error: unknown) {
    console.error({ error: "event doesnt exist anymore" }, 404);
    return c.json({ error: "event doesnt exist anymore" }, 400);
  }
};
