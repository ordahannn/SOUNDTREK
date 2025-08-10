import { z } from "zod";

/**
    signinSchema - Defines validations rules for SignIn form using zod.
**/
export const signinSchema = z.object({
    email: z.string().min(1, "Email is required!").email(),
    password: z.string().min(1, "Password is required!"),
});

export type SigninSchemaType = z.infer<typeof signinSchema>;