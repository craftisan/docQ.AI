import { z } from "zod";

export const authFormSchema = z.object({
  mode: z.enum(["login", "register"]),
  name: z // Optional
    .string()
    .trim()
    .min(1, "Name is required")
    .max(50, "Name must be at most 50 characters")
    .regex(
      /^[\p{L} \-']+$/u,
      "Name can only contain letters, spaces, hyphens or apostrophes"
    )
    .optional(),
  email: z.email("Invalid email address")
    .min(1, "Email is required")
    .max(50, "Name must be at most 50 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/\d/, "Password must contain at least one digit")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
}).refine((data) => data.mode === "login" || !!data.name, {
  path:    ["name"],
  message: "Name is required when registering",
});

export type AuthFormData = z.infer<typeof authFormSchema>;
