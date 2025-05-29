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

export const bookingEvent = z.object({
  eventId: z.string(),
});

export type userSchemaInput = z.infer<typeof createUserSchema>;
export type updateSchema = z.infer<typeof createUserSchema>;
export type signIn = z.infer<typeof userSignIn>;
export type addEvent = z.infer<typeof createEvent>;

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWI3MmY4ZHkwMDAxNWIwd3dsbjN3ZXZoIiwiZXhwIjoxNzUwOTc1NTQ5LCJpYXQiOjE3NDgzODM1NDl9.IUibwZnG2gK_QR-Ie3dm3xBeAsEHHDTVkt7P19oyWck
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzJKdWIiOiJjbWI3MnUxdnowMDAzNWIwdzhrNjZkYjJqIiwiZXhwIjoxNzUwOTc2MjQwLCJpYXQiOjE3NDgzODQyNDB9.F6xXW--dYZ1z4WKuWx26Vo0SphNmcSRFVvr6V4u2ZB8
