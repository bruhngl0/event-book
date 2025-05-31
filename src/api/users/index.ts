import { Context } from "hono";
import { getPrisma } from "../../index";
import { createUserSchema, updateUserSchema, userSignIn } from "../../types";
import bcrypt from "bcryptjs";
import { sign, verify } from "hono/jwt";
import { HTTPException } from "hono/http-exception";

//GET ALL USERS(PRIVATE ROUTE)
export const getUsers = async (c: Context) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  try {
    const users = await prisma.user.findMany({});
    return c.json(users);
  } catch {
    return c.json({ error: "failed to fetch users" }, 500);
  }
};

//CREATE A USER(PUBLIC-ROUTE)

export const createUser = async (c: Context) => {
  const prisma = getPrisma(c.env.DATABASE_URL);

  const JWT_EXPIRY_DAYS = 30;
  const JWT_EXPIRY_SECONDS = 60 * 60 * 24 * JWT_EXPIRY_DAYS;
  const BCRYPT_ROUNDS = 12;
  const expiryDate = new Date(
    Date.now() + JWT_EXPIRY_SECONDS * 1000,
  ).toUTCString();

  try {
    const body = await c.req.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ details: parsed.error.message }, 400);
    }
    const { email, name, phone, password } = parsed.data;

    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedName = name?.trim();
    const sanitizedPhone = phone?.trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });
    if (existingUser) {
      return c.json({ error: "user already exists with this email" }, 409);
    }
    const hashedPassword: string = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        email: sanitizedEmail,
        name: sanitizedName,
        phone: sanitizedPhone,
        password: hashedPassword,
      },
    });
    //generate token from the user.id and send it to the frontend headers-cookie-set-- for sso
    const payload = {
      sub: user.id,
      exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY_SECONDS,
      iat: Math.floor(Date.now() / 1000), // Issued at time
    };
    const secretKey = c.env.JWT_SECRET;
    if (!secretKey) {
      console.error("JWT_SECRET environment variable is not set");
      return c.json({ error: "Server configuration error" }, 500);
    }
    let token;
    try {
      token = await sign(payload, secretKey);
    } catch (error: unknown) {
      console.error({ error: "failed to generate authtoken" });
      return c.json({ message: "failed to generate token" }, 500);
    }

    const cookieOptions = [
      `token=${token}`,
      "HttpOnly",
      "Path=/",
      `Max-Age=${JWT_EXPIRY_SECONDS}`,
      "Secure",
      "SameSite=none",
      `Expires = ${expiryDate}`,
    ].join("; ");

    c.header("Set-Cookie", cookieOptions);

    const { password: _, ...safeUser } = user;
    return c.json(
      { user: safeUser, message: "user-created-successfully" },
      201,
    );
  } catch (error: unknown) {
    console.error("Error creating user:", error);
    return c.json({ error: "Failed to create user" }, 500);
  }
};

//user sign-in
export const signIn = async (c: Context) => {
  const prisma = getPrisma(c.env.DATABASE_URL);

  const JWT_EXPIRY_DAYS = 30;
  const JWT_EXPIRY_SECONDS = 60 * 60 * 24 * JWT_EXPIRY_DAYS;
  const BCRYPT_ROUNDS = 12;
  const expiryDate = new Date(
    Date.now() + JWT_EXPIRY_SECONDS * 1000,
  ).toUTCString();

  const body = await c.req.json();
  const parsed = userSignIn.safeParse(body);

  if (!parsed.success) {
    return c.json({ details: parsed.error.message }, 400);
  }

  const { email, password } = parsed.data;

  const sanitizedEmail = email.toLowerCase().trim();

  try {
    const userLogin = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });
    if (!userLogin) {
      console.error({ error: "user doesn't exist, please sign up" }, 404);
      return c.json({ message: "user doesn't exist, please sign up" }, 404);
    }

    const passwordMatch = await bcrypt.compare(password, userLogin.password);
    if (!passwordMatch) {
      console.error({ error: "wrong password, try again" }, 404);
      return c.json({ message: "wrong password, try again" }, 404);
    }
    const payload = {
      sub: userLogin.id,
      exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY_SECONDS,
      iat: Math.floor(Date.now() / 1000), // Issued at time
    };
    const secretKey = c.env.JWT_SECRET;
    if (!secretKey) {
      console.error("JWT_SECRET environment variable is not set");
      return c.json({ error: "Server configuration error" }, 500);
    }
    let token;
    try {
      token = await sign(payload, secretKey);
    } catch (error: unknown) {
      console.error({ error: "failed to generate authtoken" });
      return c.json({ message: "failed to generate token" }, 500);
    }

    const cookieOptions = [
      `token=${token}`,
      "HttpOnly",
      "Path=/",
      `Max-Age=${JWT_EXPIRY_SECONDS}`,
      "Secure",
      "SameSite=none",
      `Expires=${expiryDate}`,
    ].join("; ");

    c.header("Set-Cookie", cookieOptions);

    const { password: _, ...safeUserLogin } = userLogin;
    return c.json({ message: "signed in successfully", safeUserLogin }, 200);
  } catch (error) {
    console.error({ error: "failed to login" }, 400);
    return c.json({ message: "failed to login" }, 400);
  }
};

//UPDATE USER(PRIVATE-ROUTE)

export const updateUser = async (c: Context) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const userId = c.get("user");
  console.log(userId);
  if (!userId) {
    return c.json({ error: "user doesnt exist-yet" }, 400);
  }
  try {
    const body = await c.req.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "zody body didn't parse" });
    }
    const { name, phone, password } = parsed.data;
    const updatedUser: any = {};

    if (name) updatedUser.name = name;
    if (phone) updatedUser.phone = phone;
    if (password) updatedUser.password = await bcrypt.hash(password, 10);

    const updatedUserData = await prisma.user.update({
      where: { id: userId },
      data: updatedUser,
    });

    const { password: _, ...safeUpdatedUserData } = updatedUserData;
    return c.json(safeUpdatedUserData);
  } catch (error: unknown) {
    console.error("Error creating user:", error);
    return c.json({ error: "Failed to create user" }, 500);
  }
};

//DELETE A USER(PRIVATE ROUTE)

export const deleteUser = async (c: Context) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const userId = c.get("user");
  try {
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
    });
    return c.json(
      {
        message: "user deleted",
        deletedUser,
      },
      200,
    );
  } catch (error: unknown) {
    console.error("Error deleting user");
    return c.json({ error: "failed to delete user" }, 500);
  }
};

export const getUserToken = async (c: Context) => {
  const cookieHeader = c.req.header("Cookie");
  const token = cookieHeader?.match(/token=([^;]+)/)?.[1];

  if (!token) {
    throw new HTTPException(401, { message: "Unauthorized: No token found" });
  }

  try {
    const decoded = (await verify(token, c.env.JWT_SECRET)) as { sub: string }; // `sub` is userId

    const prisma = getPrisma(c.env.DATABASE_URL);
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
      },
    });

    if (!user) {
      throw new HTTPException(404, { message: "User not found" });
    }

    return c.json({ authenticated: true, user });
  } catch (err) {
    console.error(err);
    throw new HTTPException(401, { message: "Unauthorized: Invalid token" });
  }
};
