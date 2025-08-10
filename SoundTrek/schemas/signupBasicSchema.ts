import { z } from "zod";

/**
  SignUp Basic Schema
  Used for validating user inputs on the initial sign-up step
  
  Fields:
  * - firstName: required, string, min 2
  * - lastName: required, string, min 2
  * - birthDate: required, string, ISO format
  * - email: required, email format
  * - password: required, min 6 chars
  * - confirmpassword: must match password
  * - termsandprivacy: must be checked
**/
const isValidDate = (val: string) => {
  const [year, month, day] = val.split("-").map(Number);
  const date = new Date(val);
  return (
    date instanceof Date &&
    !isNaN(date.getTime()) &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day
  );
};

export const signupBasicSchema = z
  .object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    birthDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
      .refine(isValidDate, { message: "Invalid date" }),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password too short"),
    confirmpassword: z.string().min(6, "Confirm your password"),
    termsandprivacy: z.boolean().refine((v) => v === true, {
      message: "You must accept the terms",
    }),
  })
  .refine((data) => data.password === data.confirmpassword, {
    message: "Passwords do not match",
    path: ["confirmpassword"],
  });

export type SignupBasicSchemaType = z.infer<typeof signupBasicSchema>;