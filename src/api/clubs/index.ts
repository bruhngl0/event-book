import { getPrisma } from "../../index";
import { Context } from "hono";
import { createClub } from "../../types";

export const addClubs = async (c: Context) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const body = await c.req.json();
  const parsed = createClub.safeParse(body);
  if (!parsed.success) {
    return c.json({ message: parsed.error.message }, 400);
  }

  const { name } = parsed.data;
  const sanitizedName = name.trim();

  try {
    const addedClub = await prisma.club.create({
      data: { name: sanitizedName },
    });

    return c.json({ message: addedClub, addedClub }, 200);
  } catch (error: unknown) {
    console.error({ message: "failed-to-add-club" }, 400);
    return c.json({ error: "failed-to-create-club" }, 400);
  }
};
