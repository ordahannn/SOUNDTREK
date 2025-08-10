import { API_ENDPOINTS } from "@/helpers/api-helper";
import { SignupBasicSchemaType } from "@/schemas/signupBasicSchema";

/**
    signInUser - Sends a login request to the server with email and password.
 
    * @param email User's email
    * @param password User's password
    * @returns Promise resolving to one of: "success", "invalid_email", "invalid_password", or "error"
**/
export const signInUser = async (email: string, password: string): Promise<{ token: string; user: any }> => {
  const response = await fetch(API_ENDPOINTS.loginUser, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Invalid credentials");
  }

  const result = await response.json(); // Expecting { token, user }
  return result;
};

export const checkEmailExists = async (email: string): Promise<boolean> => {
    const response = await fetch(API_ENDPOINTS.checkEmail(email));
    return response.status === 200;
};

/**
  Registers a new user by sending signup form data to the server.
  * @param data - Form values for registration
  * @returns An object containing the JWT token and user data
**/
export const registerUser = async (
  data: SignupBasicSchemaType
): Promise<{ token: string; user: any }> => {
  const response = await fetch(API_ENDPOINTS.registerUser, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Registration failed: ${errText}`);
  }

  return await response.json(); // returns { token, user }
};