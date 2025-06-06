import { getPrisma } from "../../index";
import { Context } from "hono";
import { createClub } from "../../types";

//GET ALL CLUBS -- //
export const getClubs = async (c: Context) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  try {
    const getAllClubs = await prisma.club.findMany({});
    return c.json({ message: "listed all clubs", getAllClubs }, 201);
  } catch (error) {
    console.error({ message: "failed to get all clubs" }, 401);
    return c.json({ message: "falied to get all clubs" }, 400);
  }
};

//CREATE A CLUB -- //

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
    console.error({ message: "failed-to-create-club" }, 400);
    return c.json({ error: "failed-to-create-club" }, 400);
  }
};

// JOIN A CLUB --- //
export const joinClub = async (c: Context) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const userId = c.get("user");
  const clubId = c.req.param("clubId");

  if (!userId) {
    return c.json({ message: "please login/signup" });
  }

  console.log(userId.id);
  try {
    const club = await prisma.club.findUnique({
      where: { id: clubId },
    });
    if (!club) {
      return c.json({ error: "club-doesnt-exist-in-database" }, 404);
    }

    const userData = await prisma.user.update({
      where: { id: userId.id },
      data: { clubId: club.id },
    });

    return c.json({ message: "club-joined-successfully", userData }, 200);
  } catch (error: unknown) {
    console.error({ error: "user-failed-to-join-club" }, 401);
    return c.json({ message: "user-failed-to-join-club" }, 401);
  }
};
