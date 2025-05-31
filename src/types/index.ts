import { useId } from "hono/jsx";
import { z } from "zod/v4";

export const createUserSchema = z.object({
  email: z.email(),
  name: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(6),
});

export const updateUserSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().optional(),
});

export const userSignIn = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const createEvent = z.object({
  title: z.string(),
  description: z.string().optional(),
  location: z.string(),
  date: z.preprocess((val) => new Date(val as string), z.date()),
  price: z.number(),
});

export const PaymentStatusEnum = z.enum(["PENDING", "SUCCESS", "FAILED"]);

export const bookingEvent = z.object({
  eventId: z.string(),
  userId: z.string(),
  status: PaymentStatusEnum.optional().default("PENDING"),
  instagram: z.string().trim().optional(),
  linkedIn: z.string().trim().optional(),
});

export const createClub = z.object({
  name: z.string(),
  members: z.array(z.any()).optional(),
});

export type userSchemaInput = z.infer<typeof createUserSchema>;
export type updateSchema = z.infer<typeof createUserSchema>;
export type signIn = z.infer<typeof userSignIn>;
export type addEvent = z.infer<typeof createEvent>;
export type addbooking = z.infer<typeof bookingEvent>;
export type addClub = z.infer<typeof createClub>;
export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;
